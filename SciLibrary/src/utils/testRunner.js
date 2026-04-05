

import {
  TestRunner,
  AuthenticationTests,
  BookCatalogTests,
  BorrowRequestTests,
  SettingsTests,
  AdminDashboardTests,
  NotificationTests,
  validateFeatureParity,
} from './featureParityTests';


export const runFullTestSuite = async (api, config = {}) => {
  const runner = new TestRunner();

  const testContexts = {
    auth: {
      api,
      testUser: config.testUser,
      newUser: config.newUser,
    },
    books: {
      api,
      query: config.searchQuery || 'React',
      bookData: config.bookData,
    },
    borrow: {
      api,
      bookId: config.bookId,
      userId: config.userId,
    },
    settings: {
      api,
      oldPassword: config.oldPassword,
      newPassword: config.newPassword,
    },
    admin: {
      api,
    },
    notifications: {
      api,
      notificationId: config.notificationId,
    },
  };

  // Run test suites
  console.log('🚀 Starting Feature Parity Test Suite...\n');

  // Auth tests
  if (config.includeAuth !== false) {
    console.log('📝 Running Authentication Tests...');
    if (testContexts.auth.testUser) {
      const result = await AuthenticationTests.testUserLogin(api, testContexts.auth.testUser);
      runner.addResult(result);
    }
    if (testContexts.auth.newUser) {
      const result = await AuthenticationTests.testUserRegistration(api, testContexts.auth.newUser);
      runner.addResult(result);
    }
    const tokenResult = await AuthenticationTests.testTokenValidation(api);
    runner.addResult(tokenResult);
  }

  // Book tests
  if (config.includeBooks !== false) {
    console.log('📚 Running Book Catalog Tests...');
    const booksResult = await BookCatalogTests.testFetchAllBooks(api);
    runner.addResult(booksResult);

    const searchResult = await BookCatalogTests.testSearchBooks(api, testContexts.books.query);
    runner.addResult(searchResult);

    if (testContexts.books.bookData && config.includeAdminOps !== false) {
      const addResult = await BookCatalogTests.testAddBook(api, testContexts.books.bookData);
      runner.addResult(addResult);
    }
  }

  // Borrow tests
  if (config.includeBorrow !== false && testContexts.borrow.bookId) {
    console.log('📋 Running Borrow Request Tests...');
    const requestResult = await BorrowRequestTests.testRequestBorrow(
      api,
      testContexts.borrow.bookId,
      testContexts.borrow.userId
    );
    runner.addResult(requestResult);

    const fetchResult = await BorrowRequestTests.testFetchAllBorrowRequests(api);
    runner.addResult(fetchResult);
  }

  // Settings tests
  if (config.includeSettings !== false) {
    console.log('⚙️ Running Settings Tests...');
    const profileResult = await SettingsTests.testFetchUserProfile(api);
    runner.addResult(profileResult);

    if (testContexts.settings.oldPassword && testContexts.settings.newPassword) {
      const passwordResult = await SettingsTests.testUpdatePassword(
        api,
        testContexts.settings.oldPassword,
        testContexts.settings.newPassword
      );
      runner.addResult(passwordResult);
    }
  }

  // Admin tests
  if (config.includeAdmin !== false && config.adminOnly !== false) {
    console.log('👨‍💼 Running Admin Dashboard Tests...');
    const statsResult = await AdminDashboardTests.testFetchAdminStats(api);
    runner.addResult(statsResult);

    const usersResult = await AdminDashboardTests.testFetchAllUsers(api);
    runner.addResult(usersResult);
  }

  // Notification tests
  if (config.includeNotifications !== false) {
    console.log('🔔 Running Notification Tests...');
    const notifResult = await NotificationTests.testFetchNotifications(api);
    runner.addResult(notifResult);
  }

  const report = runner.getReport();
  runner.printReport();

  // Validate parity
  const parity = validateFeatureParity(report);
  console.log('\n📊 FEATURE PARITY VALIDATION:');
  console.log(`Overall Pass Rate: ${parity.overallPassRate}%`);
  console.log(`Critical Issues: ${parity.criticalIssues}`);
  console.log(`Parity Met: ${parity.isParityMet ? '✅ YES' : '❌ NO'}`);
  console.log(`Ready for Production: ${parity.readyForProduction ? '✅ YES' : '❌ NO'}\n`);

  return {
    report,
    parity,
    runner,
  };
};


export const runQuickTests = async (api) => {
  const runner = new TestRunner();

  console.log('⚡ Running Quick Validation Tests...\n');

  // Essential tests only
  const results = await Promise.all([
    AuthenticationTests.testTokenValidation(api),
    BookCatalogTests.testFetchAllBooks(api),
    SettingsTests.testFetchUserProfile(api),
  ]);

  results.forEach((r) => runner.addResult(r));
  return runner.getReport();
};


export const runAuthTests = async (api, testUser, newUser = null) => {
  const runner = new TestRunner();

  console.log('🔐 Running Authentication Flow Tests...\n');

  const results = await Promise.all([
    AuthenticationTests.testUserLogin(api, testUser),
    AuthenticationTests.testTokenValidation(api),
    ...(newUser ? [AuthenticationTests.testUserRegistration(api, newUser)] : []),
  ]);

  results.forEach((r) => runner.addResult(r));
  const report = runner.getReport();
  runner.printReport();

  return report;
};


export const runAdminTests = async (api) => {
  const runner = new TestRunner();

  console.log('👨‍💼 Running Admin Operations Tests...\n');

  const results = await Promise.all([
    AdminDashboardTests.testFetchAdminStats(api),
    AdminDashboardTests.testFetchAllUsers(api),
    BorrowRequestTests.testFetchAllBorrowRequests(api),
  ]);

  results.forEach((r) => runner.addResult(r));
  const report = runner.getReport();
  runner.printReport();

  return report;
};


export const runCriticalPathTests = async (api, testUser) => {
  const runner = new TestRunner();

  console.log('🔴 Running Critical Path Tests...\n');

  const results = await Promise.all([
    // User must be able to login
    AuthenticationTests.testUserLogin(api, testUser),
    // Must access books
    BookCatalogTests.testFetchAllBooks(api),
    // Must see profile
    SettingsTests.testFetchUserProfile(api),
  ]);

  results.forEach((r) => runner.addResult(r));
  const report = runner.getReport();

  const allPassed = report.summary.failed === 0;
  console.log(`\n${allPassed ? '✅ CRITICAL PATH PASS' : '❌ CRITICAL PATH FAIL'}\n`);

  return report;
};


export const createTestConfig = (overrides = {}) => {
  return {
    // Test flags
    includeAuth: true,
    includeBooks: true,
    includeBorrow: true,
    includeSettings: true,
    includeAdmin: true,
    includeAdminOps: false, 
    includeNotifications: true,
    adminOnly: false,

    // Test data
    testUser: {
      email: 'testuser@library.com',
      password: 'TestPass123!',
    },
    newUser: null, 
    searchQuery: 'React',
    bookData: null, 
    oldPassword: null,
    newPassword: null,
    bookId: null,
    userId: null,
    notificationId: null,

    ...overrides,
  };
};


export const generateTestSummary = (report) => {
  const { summary, results } = report;
  const byStatus = {
    passed: results.filter((r) => r.passed),
    failed: results.filter((r) => !r.passed),
  };

  const bySuite = {};
  results.forEach((r) => {
    if (!bySuite[r.suite]) {
      bySuite[r.suite] = { total: 0, passed: 0 };
    }
    bySuite[r.suite].total++;
    if (r.passed) bySuite[r.suite].passed++;
  });

  return {
    overall: summary,
    byStatus,
    bySuite,
    failureDetails: byStatus.failed.map((r) => ({
      test: r.testName,
      suite: r.suite,
      error: r.error,
    })),
  };
};


export const exportTestResults = (report, filename = 'test-results.json') => {
  const data = {
    timestamp: new Date().toISOString(),
    summary: report.summary,
    results: report.results,
  };

  
  return JSON.stringify(data, null, 2);
};

export default {
  runFullTestSuite,
  runQuickTests,
  runAuthTests,
  runAdminTests,
  runCriticalPathTests,
  createTestConfig,
  generateTestSummary,
  exportTestResults,
  TestRunner,
  validateFeatureParity,
};
