

export const TEST_SUITES = {
  AUTHENTICATION: 'authentication',
  USER_MANAGEMENT: 'user_management',
  BOOK_CATALOG: 'book_catalog',
  BORROW_REQUESTS: 'borrow_requests',
  NOTIFICATIONS: 'notifications',
  ADMIN_DASHBOARD: 'admin_dashboard',
  SETTINGS: 'settings',
};

// TEST RESULT STRUCTURE

export class TestResult {
  constructor(testName, suite) {
    this.testName = testName;
    this.suite = suite;
    this.passed = false;
    this.error = null;
    this.duration = 0;
    this.timestamp = new Date().toISOString();
    this.metadata = {};
  }

  success(metadata = {}) {
    this.passed = true;
    this.metadata = metadata;
    return this;
  }

  failure(error, metadata = {}) {
    this.passed = false;
    this.error = error instanceof Error ? error.message : String(error);
    this.metadata = metadata;
    return this;
  }

  toJSON() {
    return {
      testName: this.testName,
      suite: this.suite,
      passed: this.passed,
      error: this.error,
      duration: this.duration,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }
}

// 1. AUTHENTICATION TESTS

export const AuthenticationTests = {
  async testUserLogin(api, testUser) {
    const result = new TestResult('User Login', TEST_SUITES.AUTHENTICATION);
    const startTime = Date.now();

    try {
      const response = await api.post('/api/v1/user/login', {
        email: testUser.email,
        password: testUser.password,
      });

      // Verify response structure
      if (!response.data?.user || !response.data?.token) {
        throw new Error('Invalid login response structure');
      }

      if (!response.data.user.email || !response.data.user.role) {
        throw new Error('Incomplete user data in response');
      }

      result.success({
        userId: response.data.user._id,
        userRole: response.data.user.role,
        hasToken: !!response.data.token,
      });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/login' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testUserRegistration(api, newUser) {
    const result = new TestResult('User Registration', TEST_SUITES.AUTHENTICATION);
    const startTime = Date.now();

    try {
      const response = await api.post('/api/v1/user/register', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.password,
      });

      if (!response.data?.message) {
        throw new Error('No confirmation message in registration response');
      }

      result.success({ registrationMessage: response.data.message });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/register' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testPasswordReset(api, email) {
    const result = new TestResult('Password Reset Request', TEST_SUITES.AUTHENTICATION);
    const startTime = Date.now();

    try {
      const response = await api.post('/api/v1/user/password/forgot', {
        email,
      });

      if (!response.data?.message) {
        throw new Error('No message in password reset response');
      }

      result.success({ message: response.data.message });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/password/forgot' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testTokenValidation(api) {
    const result = new TestResult('Token Validation', TEST_SUITES.AUTHENTICATION);
    const startTime = Date.now();

    try {
      // Make any authenticated request to verify token
      const response = await api.get('/api/v1/user/profile');

      if (!response.data?.user) {
        throw new Error('Invalid profile response');
      }

      result.success({ hasActiveToken: true });
    } catch (error) {
      if (error.response?.status === 401) {
        result.failure(error, { reason: 'Token expired or invalid' });
      } else {
        result.failure(error);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// 2. BOOK CATALOG TESTS

export const BookCatalogTests = {
  async testFetchAllBooks(api) {
    const result = new TestResult('Fetch All Books', TEST_SUITES.BOOK_CATALOG);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/book/all');

      if (!Array.isArray(response.data?.books)) {
        throw new Error('Books response is not an array');
      }

      // Verify book structure
      if (response.data.books.length > 0) {
        const book = response.data.books[0];
        const requiredFields = ['_id', 'title', 'author', 'category', 'quantity'];
        const missingFields = requiredFields.filter((f) => !(f in book));

        if (missingFields.length > 0) {
          throw new Error(`Missing fields in book: ${missingFields.join(', ')}`);
        }
      }

      result.success({ totalBooks: response.data.books.length });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/book/all' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testSearchBooks(api, query) {
    const result = new TestResult('Search Books', TEST_SUITES.BOOK_CATALOG);
    const startTime = Date.now();

    try {
      const response = await api.get(`/api/v1/book/search?q=${query}`);

      if (!Array.isArray(response.data?.books)) {
        throw new Error('Search response is not an array');
      }

      result.success({ resultsFound: response.data.books.length });
    } catch (error) {
      result.failure(error, { endpoint: `/api/v1/book/search`, query });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testAddBook(api, bookData) {
    const result = new TestResult('Add Book', TEST_SUITES.BOOK_CATALOG);
    const startTime = Date.now();

    try {
      const response = await api.post('/api/v1/book/add', {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        quantity: bookData.quantity,
        isbn: bookData.isbn,
      });

      if (!response.data?.book?._id) {
        throw new Error('No book ID returned after adding book');
      }

      result.success({ bookId: response.data.book._id });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/book/add' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testUpdateBook(api, bookId, updateData) {
    const result = new TestResult('Update Book', TEST_SUITES.BOOK_CATALOG);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/book/update/${bookId}`, updateData);

      if (!response.data?.book) {
        throw new Error('No book data returned after update');
      }

      result.success({ updatedFields: Object.keys(updateData) });
    } catch (error) {
      result.failure(error, { endpoint: `/api/v1/book/update/${bookId}` });
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// 3. BORROW REQUEST TESTS

export const BorrowRequestTests = {
  async testRequestBorrow(api, bookId, userId) {
    const result = new TestResult('Request Borrow', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.post('/api/v1/borrow/request', {
        bookId,
        userId,
      });

      if (!response.data?.borrow?._id) {
        throw new Error('No borrow request ID returned');
      }

      result.success({ borrowId: response.data.borrow._id });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/borrow/request', bookId });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testFetchAllBorrowRequests(api) {
    const result = new TestResult('Fetch Borrow Requests', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/borrow/admin/all');

      if (!Array.isArray(response.data?.borrows)) {
        throw new Error('Borrow response is not an array');
      }

      result.success({ totalRequests: response.data.borrows.length });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/borrow/admin/all' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testApproveBorrow(api, borrowId, dueDate) {
    const result = new TestResult('Approve Borrow', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/borrow/admin/approve/${borrowId}`, {
        dueDate,
      });

      if (response.data?.borrow?.status !== 'Borrowed') {
        throw new Error('Borrow status not updated to Borrowed');
      }

      result.success({ newStatus: response.data.borrow.status });
    } catch (error) {
      result.failure(error, {
        endpoint: `/api/v1/borrow/admin/approve/${borrowId}`,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testRejectBorrow(api, borrowId, remarks) {
    const result = new TestResult('Reject Borrow', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/borrow/admin/reject/${borrowId}`, {
        remarks,
      });

      if (response.data?.borrow?.status !== 'Rejected') {
        throw new Error('Borrow status not updated to Rejected');
      }

      result.success({ newStatus: response.data.borrow.status });
    } catch (error) {
      result.failure(error, {
        endpoint: `/api/v1/borrow/admin/reject/${borrowId}`,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testReturnBook(api, borrowId) {
    const result = new TestResult('Return Book', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/borrow/admin/return/${borrowId}`, {});

      if (response.data?.borrow?.status !== 'Returned') {
        throw new Error('Borrow status not updated to Returned');
      }

      result.success({ newStatus: response.data.borrow.status });
    } catch (error) {
      result.failure(error, {
        endpoint: `/api/v1/borrow/admin/return/${borrowId}`,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testReportIssue(api, borrowId, issueType, remarks) {
    const result = new TestResult('Report Issue', TEST_SUITES.BORROW_REQUESTS);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/borrow/admin/report-issue/${borrowId}`, {
        issueType,
        remarks,
      });

      if (!['Lost', 'Damaged'].includes(response.data?.borrow?.status)) {
        throw new Error('Borrow status not updated to issue type');
      }

      result.success({ newStatus: response.data.borrow.status });
    } catch (error) {
      result.failure(error, {
        endpoint: `/api/v1/borrow/admin/report-issue/${borrowId}`,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// 4. SETTINGS & USER MANAGEMENT TESTS

export const SettingsTests = {
  async testUpdatePassword(api, oldPassword, newPassword) {
    const result = new TestResult('Update Password', TEST_SUITES.SETTINGS);
    const startTime = Date.now();

    try {
      const response = await api.put('/api/v1/user/password/update', {
        oldPassword,
        newPassword,
        confirmNewPassword: newPassword,
      });

      if (!response.data?.message) {
        throw new Error('No confirmation message in password update response');
      }

      result.success({ message: response.data.message });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/password/update' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testFetchUserProfile(api) {
    const result = new TestResult('Fetch User Profile', TEST_SUITES.SETTINGS);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/user/profile');

      if (!response.data?.user) {
        throw new Error('No user data in profile response');
      }

      const requiredFields = ['_id', 'name', 'email', 'role'];
      const missingFields = requiredFields.filter((f) => !(f in response.data.user));

      if (missingFields.length > 0) {
        throw new Error(`Missing fields in user profile: ${missingFields.join(', ')}`);
      }

      result.success({
        userId: response.data.user._id,
        userRole: response.data.user.role,
      });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/profile' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// 5. ADMIN DASHBOARD TESTS

export const AdminDashboardTests = {
  async testFetchAdminStats(api) {
    const result = new TestResult('Fetch Admin Stats', TEST_SUITES.ADMIN_DASHBOARD);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/borrow/admin/stats');

      const stats = response.data?.stats;
      if (!stats) {
        throw new Error('No stats data returned');
      }

      // Verify key stat fields
      const requiredStats = [
        'totalBooks',
        'activeLoans',
        'totalUsers',
        'returnedBooks',
        'pendingRequests',
        'overdueBooks',
      ];

      const missingStats = requiredStats.filter((stat) => !(stat in stats));

      if (missingStats.length > 0) {
        throw new Error(`Missing stats: ${missingStats.join(', ')}`);
      }

      result.success({ statsAvailable: requiredStats });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/borrow/admin/stats' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testFetchAllUsers(api) {
    const result = new TestResult('Fetch All Users', TEST_SUITES.ADMIN_DASHBOARD);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/user/all');

      if (!Array.isArray(response.data?.users)) {
        throw new Error('Users response is not an array');
      }

      result.success({ totalUsers: response.data.users.length });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/user/all' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// 6. NOTIFICATION TESTS

export const NotificationTests = {
  async testFetchNotifications(api) {
    const result = new TestResult('Fetch Notifications', TEST_SUITES.NOTIFICATIONS);
    const startTime = Date.now();

    try {
      const response = await api.get('/api/v1/notification/all');

      if (!Array.isArray(response.data?.notifications)) {
        throw new Error('Notifications response is not an array');
      }

      if (response.data.notifications.length > 0) {
        const notif = response.data.notifications[0];
        if (!notif._id || !notif.type) {
          throw new Error('Invalid notification structure');
        }
      }

      result.success({
        totalNotifications: response.data.notifications.length,
      });
    } catch (error) {
      result.failure(error, { endpoint: '/api/v1/notification/all' });
    }

    result.duration = Date.now() - startTime;
    return result;
  },

  async testMarkNotificationAsRead(api, notificationId) {
    const result = new TestResult('Mark Notification as Read', TEST_SUITES.NOTIFICATIONS);
    const startTime = Date.now();

    try {
      const response = await api.put(`/api/v1/notification/${notificationId}/read`, {});

      if (!response.data?.notification) {
        throw new Error('No notification data returned');
      }

      result.success({ marked: 'read' });
    } catch (error) {
      result.failure(error, {
        endpoint: `/api/v1/notification/${notificationId}/read`,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  },
};

// TEST RUNNER & REPORTING

export class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  addResult(result) {
    this.results.push(result);
  }

  async runTests(tests, context = {}) {
    this.startTime = Date.now();

    for (const testFunc of tests) {
      try {
        const result = await testFunc(context);
        this.addResult(result);
      } catch (error) {
        console.error('Test execution failed:', error);
      }
    }

    this.endTime = Date.now();
    return this.getReport();
  }

  getReport() {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    return {
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0,
        duration: this.endTime - this.startTime,
      },
      results: this.results.map((r) => r.toJSON()),
      timestamp: new Date().toISOString(),
    };
  }

  printReport() {
    const report = this.getReport();
    const { summary } = report;

    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 TEST REPORT');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Total Tests:   ${summary.total}`);
    console.log(`✅ Passed:     ${summary.passed}`);
    console.log(`❌ Failed:     ${summary.failed}`);
    console.log(`Pass Rate:     ${summary.passRate}%`);
    console.log(`Duration:      ${summary.duration}ms`);
    console.log('════════════════════════════════════════════════════════\n');

    report.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.testName}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n════════════════════════════════════════════════════════\n');

    return report;
  }
}

// FEATURE PARITY VALIDATOR

export const validateFeatureParity = (report) => {
  const failures = report.results.filter((r) => !r.passed);
  const criticalTests = [
    'User Login',
    'Fetch All Books',
    'Request Borrow',
    'Fetch Borrow Requests',
    'Approve Borrow',
    'Fetch User Profile',
    'Fetch Admin Stats',
  ];

  const criticalFailures = failures.filter((f) =>
    criticalTests.includes(f.testName)
  );

  return {
    isParityMet: report.summary.failed === 0,
    criticalIssues: criticalFailures.length,
    overallPassRate: report.summary.passRate,
    readyForProduction: report.summary.failed === 0 && report.summary.passRate >= 95,
  };
};
