"""Source contract checks; no dashboard formula or allocation model changes."""
import csv
import json
import sys
import unittest
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

from capacity_sources import FILES, TEAMS, amount, load, read

ROOT = Path(__file__).resolve().parents[1]

class CapacitySourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.roster, cls.capacity, cls.report = load(ROOT)

    def test_roster_identity_and_zero_membership(self):
        self.assertEqual(len(self.roster), self.roster['Assignee ID'].nunique())
        self.assertEqual(set(self.roster.Team), TEAMS)
        self.assertFalse(self.roster.Assignee.str.contains('Ionut',case=False).any())
        v = self.roster[self.roster['Assignee ID']=='1296'].iloc[0]
        self.assertEqual((v.Team,v.Availability),('Nexus','0%'))

    def test_invalid_hours_rejected(self):
        for value in ['-1','nan','inf','oops','']:
            with self.assertRaises(ValueError): amount(value)
        self.assertEqual(amount('0'),0)

    def test_duplicate_canonical_id_rejected(self):
        original = read
        def duplicate(path):
            rows = original(path)
            return rows + [rows[0]] if path.name == FILES['Assignees master'] else rows
        with patch('capacity_sources.read',side_effect=duplicate):
            with self.assertRaisesRegex(ValueError,'duplicate canonical ID'):
                load(ROOT)

    def test_weekly_source_totals_and_missingness(self):
        rows = read(ROOT/'data/raw'/FILES['Weekly capacity'])
        numeric = [r for r in rows if r['Assignee'] and r['Week Number'] and r['Planned Hours'].strip()]
        expected = sum((Decimal(r['Planned Hours'].replace(',','')) for r in numeric),Decimal(0))
        self.assertAlmostEqual(float(expected),self.report['totals']['weeklyDevelopment'])
        self.assertEqual(len(self.capacity),len(self.capacity.drop_duplicates(['Assignee ID','Week Number'])))
        missing = [r for r in self.report['weekly'] if r['development'] is None]
        self.assertEqual(len(missing),len(self.report['quarantine']))
        self.assertTrue(all(r['combined'] is None for r in missing))
        self.assertTrue(all(r['engineeringNet'] is None for r in self.report['weekly']))
        blanks = [r for r in rows if r['Assignee'] and r['Week Number'] and not r['Planned Hours'].strip()]
        self.assertEqual(self.report['blankPlannedHoursAsZero'],len(blanks))
        by_key = {(r['assigneeId'],r['week']):r for r in self.report['weekly']}
        self.assertTrue(all(by_key[(r['Assignee ID'],int(r['Week Number']))]['development']==0 for r in blanks))

    def test_support_once_and_separate_from_engineering(self):
        r=self.report
        self.assertAlmostEqual(sum(x['support'] for x in r['weekly']),r['supportFooter'])
        self.assertFalse(r['supportExceptions'])
        self.assertAlmostEqual(r['totals']['developmentPlusSupport'],r['totals']['weeklyDevelopment']+r['totals']['weeklySupport'])
        self.assertIsNone(r['netEngineering'])
        oleg=next(x for x in r['people'] if x['assigneeId']=='1314')
        self.assertGreater(oleg['weeklySupport'],0)
        self.assertGreater(oleg['grossEngineering'],0)
        self.assertIsNone(oleg['netEngineering'])

    def test_no_active_recovery_input_dependency(self):
        with patch('capacity_sources.read',side_effect=lambda p: (_ for _ in ()).throw(AssertionError('Recovery read')) if p.name=='rollback-single-team.csv' else read(p)):
            load(ROOT)

if __name__=='__main__': unittest.main()
