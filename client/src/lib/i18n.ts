// Feeri System - Internationalization (Arabic/English)
// Design: Corporate Dark Luxury - ألوان شعار Feeri Holding

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // App
    appName: 'Feeri System',
    appSubtitle: 'نظام إدارة الشركات',
    
    // Navigation
    dashboard: 'الرئيسية',
    crm: 'إدارة العملاء',
    hr: 'الموارد البشرية',
    accounting: 'المحاسبة',
    reports: 'التقارير',
    businessDev: 'تطوير الأعمال',
    messages: 'الرسائل',
    contracts: 'العقود',
    partnerships: 'الشراكات',
    carRental: 'إيجار السيارات',
    tasks: 'المهام',
    settings: 'الإعدادات',
    companies: 'الشركات',
    
    // Dashboard
    totalRevenue: 'إجمالي الإيرادات',
    totalExpenses: 'إجمالي المصروفات',
    netProfit: 'صافي الربح',
    activeContracts: 'العقود النشطة',
    totalEmployees: 'إجمالي الموظفين',
    activeClients: 'العملاء النشطون',
    pendingTasks: 'المهام المعلقة',
    activeVehicles: 'المركبات النشطة',
    
    // Common
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    view: 'عرض',
    close: 'إغلاق',
    confirm: 'تأكيد',
    status: 'الحالة',
    actions: 'الإجراءات',
    name: 'الاسم',
    date: 'التاريخ',
    amount: 'المبلغ',
    description: 'الوصف',
    type: 'النوع',
    category: 'الفئة',
    notes: 'ملاحظات',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'معلق',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    inProgress: 'جاري',
    
    // CRM
    clients: 'العملاء',
    leads: 'العملاء المحتملون',
    opportunities: 'الفرص',
    addClient: 'إضافة عميل',
    clientName: 'اسم العميل',
    company: 'الشركة',
    
    // HR
    employees: 'الموظفون',
    addEmployee: 'إضافة موظف',
    department: 'القسم',
    position: 'المنصب',
    salary: 'الراتب',
    attendance: 'الحضور',
    leaves: 'الإجازات',
    
    // Accounting
    invoices: 'الفواتير',
    expenses: 'المصروفات',
    income: 'الإيرادات',
    balance: 'الرصيد',
    addTransaction: 'إضافة معاملة',
    
    // Contracts
    addContract: 'إضافة عقد',
    contractValue: 'قيمة العقد',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ الانتهاء',
    
    // Car Rental
    vehicles: 'المركبات',
    rentals: 'الإيجارات',
    addVehicle: 'إضافة مركبة',
    available: 'متاح',
    rented: 'مؤجر',
    maintenance: 'صيانة',
    
    // Tasks
    addTask: 'إضافة مهمة',
    assignee: 'المسؤول',
    priority: 'الأولوية',
    dueDate: 'تاريخ الاستحقاق',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    
    // Settings
    permissions: 'الصلاحيات',
    users: 'إدارة المستخدمين',
    roles: 'الأدوار',
    profile: 'الملف الشخصي',
    language: 'اللغة',
    theme: 'المظهر',
    addModule: 'إضافة نشاط جديد',
    
    // Charts
    monthlyRevenue: 'الإيرادات الشهرية',
    expenseBreakdown: 'توزيع المصروفات',
    performanceOverview: 'نظرة عامة على الأداء',
    
    // Months
    jan: 'يناير', feb: 'فبراير', mar: 'مارس', apr: 'أبريل',
    may: 'مايو', jun: 'يونيو', jul: 'يوليو', aug: 'أغسطس',
    sep: 'سبتمبر', oct: 'أكتوبر', nov: 'نوفمبر', dec: 'ديسمبر',
    
    // Partnerships
    partners: 'الشركاء',
    addPartner: 'إضافة شريك',
    partnershipType: 'نوع الشراكة',
    sharePercentage: 'نسبة الحصة',
    
    // Companies
    addCompany: 'إضافة شركة',
    companyName: 'اسم الشركة',
    industry: 'القطاع',
    allCompanies: 'جميع الشركات',
    
    // Notifications
    notifications: 'الإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    
    // Misc
    welcome: 'مرحباً',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذا العام',
    vsLastMonth: 'مقارنة بالشهر الماضي',
    currency: 'ر.س',
  },
  en: {
    appName: 'Feeri System',
    appSubtitle: 'Company Management System',
    
    dashboard: 'Dashboard',
    crm: 'CRM',
    hr: 'Human Resources',
    accounting: 'Accounting',
    reports: 'Reports',
    businessDev: 'Business Dev',
    messages: 'Messages',
    contracts: 'Contracts',
    partnerships: 'Partnerships',
    carRental: 'Car Rental',
    tasks: 'Tasks',
    settings: 'Settings',
    companies: 'Companies',
    
    totalRevenue: 'Total Revenue',
    totalExpenses: 'Total Expenses',
    netProfit: 'Net Profit',
    activeContracts: 'Active Contracts',
    totalEmployees: 'Total Employees',
    activeClients: 'Active Clients',
    pendingTasks: 'Pending Tasks',
    activeVehicles: 'Active Vehicles',
    
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
    status: 'Status',
    actions: 'Actions',
    name: 'Name',
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    type: 'Type',
    category: 'Category',
    notes: 'Notes',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    inProgress: 'In Progress',
    
    clients: 'Clients',
    leads: 'Leads',
    opportunities: 'Opportunities',
    addClient: 'Add Client',
    clientName: 'Client Name',
    company: 'Company',
    
    employees: 'Employees',
    addEmployee: 'Add Employee',
    department: 'Department',
    position: 'Position',
    salary: 'Salary',
    attendance: 'Attendance',
    leaves: 'Leaves',
    
    invoices: 'Invoices',
    expenses: 'Expenses',
    income: 'Income',
    balance: 'Balance',
    addTransaction: 'Add Transaction',
    
    addContract: 'Add Contract',
    contractValue: 'Contract Value',
    startDate: 'Start Date',
    endDate: 'End Date',
    
    vehicles: 'Vehicles',
    rentals: 'Rentals',
    addVehicle: 'Add Vehicle',
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
    
    addTask: 'Add Task',
    assignee: 'Assignee',
    priority: 'Priority',
    dueDate: 'Due Date',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    
    permissions: 'Permissions',
    users: 'User Management',
    roles: 'Roles',
    profile: 'Profile',
    language: 'Language',
    theme: 'Theme',
    addModule: 'Add New Module',
    
    monthlyRevenue: 'Monthly Revenue',
    expenseBreakdown: 'Expense Breakdown',
    performanceOverview: 'Performance Overview',
    
    jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
    may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug',
    sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
    
    partners: 'Partners',
    addPartner: 'Add Partner',
    partnershipType: 'Partnership Type',
    sharePercentage: 'Share %',
    
    addCompany: 'Add Company',
    companyName: 'Company Name',
    industry: 'Industry',
    allCompanies: 'All Companies',
    
    notifications: 'Notifications',
    markAllRead: 'Mark All as Read',
    
    welcome: 'Welcome',
    loading: 'Loading...',
    noData: 'No data available',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    vsLastMonth: 'vs last month',
    currency: 'SAR',
  }
};

export type TranslationKey = keyof typeof translations.ar;

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.ar[key] || key;
}
