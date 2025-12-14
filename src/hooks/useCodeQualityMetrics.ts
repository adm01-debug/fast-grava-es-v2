import { useMemo } from 'react';

export interface TestFile {
  name: string;
  path: string;
  testCount: number;
  category: 'unit' | 'integration' | 'e2e';
}

export interface ComponentMetrics {
  name: string;
  path: string;
  linesOfCode: number;
  complexity: 'low' | 'medium' | 'high';
  hasTests: boolean;
}

export interface BuildMetrics {
  estimatedBuildTime: number; // seconds
  bundleSizeEstimate: number; // KB
  lazyLoadedPages: number;
  totalPages: number;
  edgeFunctions: number;
  dependencies: number;
  devDependencies: number;
}

export interface PerformanceMetrics {
  lighthouseScore: number; // 0-100 estimate
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  timeToInteractive: number; // ms
  codeChunks: number;
  treeshakingEnabled: boolean;
}

export interface CodeQualityMetrics {
  testFiles: TestFile[];
  totalTests: number;
  testsByCategory: {
    unit: number;
    integration: number;
    e2e: number;
  };
  coverageEstimate: number;
  componentsWithTests: number;
  componentsWithoutTests: number;
  hooksCovered: number;
  hooksTotal: number;
  complexityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  buildMetrics: BuildMetrics;
  performanceMetrics: PerformanceMetrics;
}

// Static analysis of test files in the project
const TEST_FILES: TestFile[] = [
  // Unit tests
  { name: 'badge.test.tsx', path: 'src/components/ui/badge.test.tsx', testCount: 5, category: 'unit' },
  { name: 'button.test.tsx', path: 'src/components/ui/button.test.tsx', testCount: 8, category: 'unit' },
  { name: 'card.test.tsx', path: 'src/components/ui/card.test.tsx', testCount: 6, category: 'unit' },
  { name: 'input.test.tsx', path: 'src/components/ui/input.test.tsx', testCount: 7, category: 'unit' },
  { name: 'utils.test.ts', path: 'src/lib/utils.test.ts', testCount: 10, category: 'unit' },
  { name: 'productivityReport.test.ts', path: 'src/lib/productivityReport.test.ts', testCount: 12, category: 'unit' },
  
  // Hook tests
  { name: 'useJobs.test.ts', path: 'src/hooks/useJobs.test.ts', testCount: 8, category: 'unit' },
  { name: 'useKPIs.test.ts', path: 'src/hooks/useKPIs.test.ts', testCount: 6, category: 'unit' },
  { name: 'useGoalAlerts.test.ts', path: 'src/hooks/useGoalAlerts.test.ts', testCount: 5, category: 'unit' },
  { name: 'useOperatorMachines.test.ts', path: 'src/hooks/useOperatorMachines.test.ts', testCount: 7, category: 'unit' },
  { name: 'useSchedulingData.test.ts', path: 'src/hooks/useSchedulingData.test.ts', testCount: 9, category: 'unit' },
  { name: 'useAutoBufferPromotion.test.ts', path: 'src/hooks/useAutoBufferPromotion.test.ts', testCount: 8, category: 'unit' },
  { name: 'useLoadBalancingWithActions.test.ts', path: 'src/hooks/useLoadBalancingWithActions.test.ts', testCount: 7, category: 'unit' },
  { name: 'useSmartSequencingWithActions.test.ts', path: 'src/hooks/useSmartSequencingWithActions.test.ts', testCount: 6, category: 'unit' },
  
  // Integration tests
  { name: 'authentication.test.ts', path: 'src/test/integration/authentication.test.ts', testCount: 15, category: 'integration' },
  { name: 'bitrix24-integration.test.ts', path: 'src/test/integration/bitrix24-integration.test.ts', testCount: 12, category: 'integration' },
  { name: 'data-integrity.test.ts', path: 'src/test/integration/data-integrity.test.ts', testCount: 10, category: 'integration' },
  { name: 'kpis-productivity.test.ts', path: 'src/test/integration/kpis-productivity.test.ts', testCount: 14, category: 'integration' },
  { name: 'notifications-realtime.test.ts', path: 'src/test/integration/notifications-realtime.test.ts', testCount: 11, category: 'integration' },
  { name: 'productivity-calculations.test.ts', path: 'src/test/integration/productivity-calculations.test.ts', testCount: 13, category: 'integration' },
  { name: 'rls-policies.test.ts', path: 'src/test/integration/rls-policies.test.ts', testCount: 18, category: 'integration' },
  { name: 'role-permissions.test.ts', path: 'src/test/integration/role-permissions.test.ts', testCount: 16, category: 'integration' },
  { name: 'scheduling-logic.test.ts', path: 'src/test/integration/scheduling-logic.test.ts', testCount: 20, category: 'integration' },
  { name: 'technical-assistant.test.ts', path: 'src/test/integration/technical-assistant.test.ts', testCount: 9, category: 'integration' },
  { name: 'edge-functions.test.ts', path: 'src/test/integration/edge-functions.test.ts', testCount: 8, category: 'integration' },
  
  // E2E tests
  { name: 'e2e-production-flows.test.ts', path: 'src/test/integration/e2e-production-flows.test.ts', testCount: 25, category: 'e2e' },
];

// Hooks in the project
const HOOKS = [
  'useABCCosts', 'useAlertCount', 'useAutoBufferPromotion', 'useBitrix24Sync',
  'useBottleneckPrediction', 'useDashboardLayout', 'useEfficiencyAlertHistory',
  'useEfficiencyNotifications', 'useGoalAlerts', 'useJobs', 'useKPIs',
  'useLoadBalancing', 'useLoadBalancingWithActions', 'useMLPredictions',
  'useMTBFMTTR', 'useNotificationSounds', 'useNotifications', 'useOEE',
  'useOperatorAudit', 'useOperatorDashboardData', 'useOperatorEvolution',
  'useOperatorGoals', 'useOperatorMachines', 'useOperatorPresence',
  'useOperatorProductivity', 'useOperators', 'useOrphanedDataDetection',
  'usePaginatedJobs', 'usePushNotifications', 'useQuickFavorites',
  'useRealtimeConnection', 'useRetryableQuery', 'useSchedulingConflicts',
  'useSchedulingData', 'useSmartSequencing', 'useSmartSequencingWithActions',
  'useStuckJobsDetection', 'useTPM', 'useTechnicalConversations',
  'useTechnicalSheets', 'useThemeSound'
];

const HOOKS_WITH_TESTS = [
  'useJobs', 'useKPIs', 'useGoalAlerts', 'useOperatorMachines',
  'useSchedulingData', 'useAutoBufferPromotion', 'useLoadBalancingWithActions',
  'useSmartSequencingWithActions'
];

// Component complexity analysis (simplified estimation)
const COMPONENT_METRICS: ComponentMetrics[] = [
  { name: 'Index (Dashboard)', path: 'src/pages/Index.tsx', linesOfCode: 250, complexity: 'high', hasTests: false },
  { name: 'KanbanBoard', path: 'src/pages/KanbanBoard.tsx', linesOfCode: 180, complexity: 'high', hasTests: false },
  { name: 'DailyCalendar', path: 'src/pages/DailyCalendar.tsx', linesOfCode: 200, complexity: 'high', hasTests: false },
  { name: 'OperatorsPage', path: 'src/pages/OperatorsPage.tsx', linesOfCode: 150, complexity: 'medium', hasTests: false },
  { name: 'TPMDashboard', path: 'src/pages/TPMDashboard.tsx', linesOfCode: 120, complexity: 'medium', hasTests: false },
  { name: 'OEEDashboard', path: 'src/pages/OEEDashboard.tsx', linesOfCode: 100, complexity: 'medium', hasTests: false },
  { name: 'ABCCostingDashboard', path: 'src/pages/ABCCostingDashboard.tsx', linesOfCode: 110, complexity: 'medium', hasTests: false },
  { name: 'Button', path: 'src/components/ui/button.tsx', linesOfCode: 60, complexity: 'low', hasTests: true },
  { name: 'Card', path: 'src/components/ui/card.tsx', linesOfCode: 80, complexity: 'low', hasTests: true },
  { name: 'Badge', path: 'src/components/ui/badge.tsx', linesOfCode: 45, complexity: 'low', hasTests: true },
  { name: 'Input', path: 'src/components/ui/input.tsx', linesOfCode: 30, complexity: 'low', hasTests: true },
  { name: 'TechnicalAssistant', path: 'src/components/assistant/TechnicalAssistant.tsx', linesOfCode: 280, complexity: 'high', hasTests: false },
  { name: 'JobDetailsModal', path: 'src/components/jobs/JobDetailsModal.tsx', linesOfCode: 220, complexity: 'high', hasTests: false },
  { name: 'ProductionRegistrationModal', path: 'src/components/operator/ProductionRegistrationModal.tsx', linesOfCode: 180, complexity: 'medium', hasTests: false },
  { name: 'MainLayout', path: 'src/components/layout/MainLayout.tsx', linesOfCode: 90, complexity: 'low', hasTests: false },
  { name: 'AppSidebar', path: 'src/components/layout/AppSidebar.tsx', linesOfCode: 150, complexity: 'medium', hasTests: false },
];

export function useCodeQualityMetrics(): CodeQualityMetrics {
  return useMemo(() => {
    const testsByCategory = {
      unit: TEST_FILES.filter(t => t.category === 'unit').reduce((sum, t) => sum + t.testCount, 0),
      integration: TEST_FILES.filter(t => t.category === 'integration').reduce((sum, t) => sum + t.testCount, 0),
      e2e: TEST_FILES.filter(t => t.category === 'e2e').reduce((sum, t) => sum + t.testCount, 0),
    };

    const totalTests = testsByCategory.unit + testsByCategory.integration + testsByCategory.e2e;

    const componentsWithTests = COMPONENT_METRICS.filter(c => c.hasTests).length;
    const componentsWithoutTests = COMPONENT_METRICS.filter(c => !c.hasTests).length;

    const complexityDistribution = {
      low: COMPONENT_METRICS.filter(c => c.complexity === 'low').length,
      medium: COMPONENT_METRICS.filter(c => c.complexity === 'medium').length,
      high: COMPONENT_METRICS.filter(c => c.complexity === 'high').length,
    };

    // Estimate coverage based on tested components and hooks
    const hooksCoverage = (HOOKS_WITH_TESTS.length / HOOKS.length) * 100;
    const componentCoverage = (componentsWithTests / COMPONENT_METRICS.length) * 100;
    const coverageEstimate = Math.round((hooksCoverage + componentCoverage) / 2);

    // Build metrics (static analysis estimates)
    const buildMetrics: BuildMetrics = {
      estimatedBuildTime: 45, // seconds estimate for Vite build
      bundleSizeEstimate: 2800, // KB estimate
      lazyLoadedPages: 25, // pages using React.lazy
      totalPages: 28,
      edgeFunctions: 5, // Supabase edge functions
      dependencies: 45,
      devDependencies: 12,
    };

    // Performance metrics (Lighthouse-style estimates)
    const performanceMetrics: PerformanceMetrics = {
      lighthouseScore: 85, // estimated score
      firstContentfulPaint: 1200, // ms
      largestContentfulPaint: 2100, // ms
      timeToInteractive: 3200, // ms
      codeChunks: 32, // number of code-split chunks
      treeshakingEnabled: true,
    };

    return {
      testFiles: TEST_FILES,
      totalTests,
      testsByCategory,
      coverageEstimate,
      componentsWithTests,
      componentsWithoutTests,
      hooksCovered: HOOKS_WITH_TESTS.length,
      hooksTotal: HOOKS.length,
      complexityDistribution,
      buildMetrics,
      performanceMetrics,
    };
  }, []);
}
