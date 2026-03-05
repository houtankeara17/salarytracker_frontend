// src/locales/translations.js
const translations = {
  en: {
    // Nav
    dashboard:"Dashboard", expenses:"Expenses", salary:"Salary", savings:"Savings",
    trips:"Trips", goals:"Goals", givings:"Givings", others:"Others", settings:"Settings",
    // Dashboard
    dailyExpenses:"Daily Expenses", weeklyExpenses:"Weekly Expenses",
    monthlyExpenses:"Monthly Expenses", yearlyExpenses:"Yearly Expenses",
    totalSalary:"Total Salary", totalSaving:"Total Saving", spendable:"Spendable",
    remaining:"Remaining", clickToView:"Click to view",
    completedDeduction:"Completed Plans (deducted)", plansOverview:"Plans Overview",
    recentTrips:"Recent Trips", recentGoals:"Recent Goals",
    recentGivings:"Recent Givings", recentOthers:"Recent Others",
    noPlans:"No plans yet",
    // Actions
    addNew:"Add New", add:"Add", edit:"Edit", delete:"Delete", save:"Save",
    cancel:"Cancel", close:"Close", confirm:"Confirm", update:"Update",
    viewAll:"View All",
    // Auth
    login:"Sign In", register:"Register", logout:"Logout",
    email:"Email", password:"Password", confirmPassword:"Confirm Password",
    name:"Full Name", loginTitle:"Sign in to your account",
    registerTitle:"Create Account", noAccount:"Don't have an account?",
    hasAccount:"Already have an account?",
    // Expense fields
    itemName:"Item Name", category:"Category", quantity:"Quantity", date:"Date",
    amount:"Amount", currency:"Currency", notes:"Notes",
    paymentMethod:"Payment Method", qrImage:"QR Image (optional)",
    uploadQR:"Upload QR Code", exchangeRate:"Exchange Rate (1 USD = KHR)",
    // Categories
    food:"Food", coffee:"Coffee", water:"Water", transport:"Transport",
    clothing:"Clothing", health:"Health", entertainment:"Entertainment",
    education:"Education", utilities:"Utilities", shopping:"Shopping", other:"Other",
    // Payment
    cash:"Cash", qr:"QR Code", card:"Card", transfer:"Transfer",
    // Salary
    month:"Month", year:"Year", addSalary:"Add Salary", addSaving:"Add Saving",
    editSalary:"Edit Salary", editSaving:"Edit Saving",
    months:["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    // Status
    planned:"Planned", ongoing:"On Going", completed:"Completed", cancelled:"Cancelled",
    // Plans
    title:"Title", destination:"Destination", targetAmount:"Target Amount",
    savedAmount:"Saved Amount", targetDate:"Target Date", startDate:"Start Date",
    endDate:"End Date", status:"Status", progress:"Progress",
    addTrip:"Add Trip", addGoal:"Add Goal", addGiving:"Add Giving", addOther:"Add Other",
    description:"Description", recipient:"Recipient", givenAmount:"Given Amount",
    paidAmount:"Paid Amount",
    // Delete
    deleteConfirm:"Confirm Delete",
    deleteMessage:"Are you sure you want to delete this item? This action cannot be undone.",
    deleteBtn:"Delete",
    // Theme / Lang
    theme:"Theme", light:"Light", dark:"Dark", system:"System", language:"Language",
    // Calendar
    prev:"Previous", next:"Next", today:"Today", noData:"No data",
    noExpenses:"No expenses recorded", total:"Total", count:"Count", items:"items",
    // Misc
    loading:"Loading...", error:"Error", success:"Success",
    addedSuccess:"Added successfully!", updatedSuccess:"Updated successfully!",
    deletedSuccess:"Deleted successfully!", weekly:"Weekly", monthly:"Monthly",
    yearly:"Yearly", daily:"Daily", back:"Back", search:"Search", filter:"Filter",
    allCategories:"All Categories", allMonths:"All Months", previous:"Previous",
    profile:"Profile", changePassword:"Change Password", currentPassword:"Current Password",
    newPassword:"New Password",
  },
  kh: {
    // Nav
    dashboard:"ផ្ទាំងគ្រប់គ្រង", expenses:"ការចំណាយ", salary:"ប្រាក់ខែ",
    savings:"ការសន្សំ", trips:"ដំណើរកម្សាន្ត", goals:"គោលដៅ",
    givings:"ការផ្តល់ជំនួយ", others:"ផ្សេងៗ", settings:"ការកំណត់",
    // Dashboard
    dailyExpenses:"ចំណាយប្រចាំថ្ងៃ", weeklyExpenses:"ចំណាយប្រចាំសប្តាហ៍",
    monthlyExpenses:"ចំណាយប្រចាំខែ", yearlyExpenses:"ចំណាយប្រចាំឆ្នាំ",
    totalSalary:"ប្រាក់ខែសរុប", totalSaving:"ការសន្សំសរុប",
    spendable:"អាចចំណាយបាន", remaining:"នៅសល់", clickToView:"ចុចដើម្បីមើល",
    completedDeduction:"ផែនការបានបញ្ចប់ (ដកចេញ)", plansOverview:"ការពិនិត្យផែនការ",
    recentTrips:"ដំណើរថ្មីៗ", recentGoals:"គោលដៅថ្មីៗ",
    recentGivings:"ការផ្តល់ថ្មីៗ", recentOthers:"ផ្សេងៗថ្មីៗ",
    noPlans:"មិនទាន់មានផែនការ",
    // Actions
    addNew:"បន្ថែមថ្មី", add:"បន្ថែម", edit:"កែប្រែ", delete:"លុប", save:"រក្សាទុក",
    cancel:"បោះបង់", close:"បិទ", confirm:"បញ្ជាក់", update:"ធ្វើបច្ចុប្បន្នភាព",
    viewAll:"មើលទាំងអស់",
    // Auth
    login:"ចូលប្រើប្រាស់", register:"ចុះឈ្មោះ", logout:"ចេញ",
    email:"អ៊ីម៉ែល", password:"ពាក្យសម្ងាត់", confirmPassword:"បញ្ជាក់ពាក្យសម្ងាត់",
    name:"ឈ្មោះពេញ", loginTitle:"ចូលប្រើប្រាស់គណនីរបស់អ្នក",
    registerTitle:"បង្កើតគណនី", noAccount:"មិនទាន់មានគណនី?",
    hasAccount:"មានគណនីហើយ?",
    // Expense
    itemName:"ឈ្មោះទំនិញ", category:"ប្រភេទ", quantity:"ចំនួន",
    date:"កាលបរិច្ឆេទ", amount:"ចំនួនទឹកប្រាក់", currency:"រូបិយបណ្ណ",
    notes:"កំណត់ចំណាំ", paymentMethod:"វិធីបង់ប្រាក់",
    qrImage:"រូបភាព QR (ជាជម្រើស)", uploadQR:"បង្ហោះ QR Code",
    exchangeRate:"អត្រាប្តូរប្រាក់ (១ USD = KHR)",
    // Categories
    food:"អាហារ", coffee:"កាហ្វេ", water:"ទឹក", transport:"ការដឹកជញ្ជូន",
    clothing:"សំលៀកបំពាក់", health:"សុខភាព", entertainment:"កម្សាន្ត",
    education:"ការអប់រំ", utilities:"ប្រើប្រាស់", shopping:"ទិញទំនិញ", other:"ផ្សេងៗ",
    // Payment
    cash:"សាច់ប្រាក់", qr:"QR Code", card:"កាតឥណទាន", transfer:"ផ្ទេរប្រាក់",
    // Salary
    month:"ខែ", year:"ឆ្នាំ", addSalary:"បន្ថែមប្រាក់ខែ", addSaving:"បន្ថែមការសន្សំ",
    editSalary:"កែប្រែប្រាក់ខែ", editSaving:"កែប្រែការសន្សំ",
    months:["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"],
    monthsShort:["មករា","កុម្ភ","មីនា","មេសា","ឧសភ","មិថ","កក្ក","សីហ","កញ្ញ","តុលា","វិច្ឆ","ធ្នូ"],
    // Status
    planned:"បានគ្រោង", ongoing:"កំពុងដំណើរការ", completed:"បានបញ្ចប់", cancelled:"បានបោះបង់",
    // Plans
    title:"ចំណងជើង", destination:"ទីកន្លែង", targetAmount:"ចំនួនគោលដៅ",
    savedAmount:"ចំនួនបានសន្សំ", targetDate:"កាលបរិច្ឆេទគោលដៅ",
    startDate:"ថ្ងៃចាប់ផ្ដើម", endDate:"ថ្ងៃបញ្ចប់", status:"ស្ថានភាព",
    progress:"ដំណើរការ", addTrip:"បន្ថែមដំណើរ", addGoal:"បន្ថែមគោលដៅ",
    addGiving:"បន្ថែមការផ្តល់", addOther:"បន្ថែមផ្សេងៗ",
    description:"ការពិពណ៌នា", recipient:"អ្នកទទួល",
    givenAmount:"ចំនួនបានផ្តល់", paidAmount:"ចំនួនបានបង់",
    // Delete
    deleteConfirm:"បញ្ជាក់ការលុប",
    deleteMessage:"តើអ្នកពិតជាចង់លុបធាតុនេះ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    deleteBtn:"លុប",
    // Theme
    theme:"រចនាបថ", light:"ពន្លឺ", dark:"ងងឹត", system:"ប្រព័ន្ធ", language:"ភាសា",
    // Calendar
    prev:"មុន", next:"បន្ទាប់", today:"ថ្ងៃនេះ", noData:"គ្មានទិន្នន័យ",
    noExpenses:"មិនមានការចំណាយ", total:"សរុប", count:"ចំនួន", items:"ធាតុ",
    // Misc
    loading:"កំពុងផ្ទុក...", error:"កំហុស", success:"ជោគជ័យ",
    addedSuccess:"បន្ថែមដោយជោគជ័យ!", updatedSuccess:"ធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!",
    deletedSuccess:"លុបដោយជោគជ័យ!", weekly:"ប្រចាំសប្តាហ៍", monthly:"ប្រចាំខែ",
    yearly:"ប្រចាំឆ្នាំ", daily:"ប្រចាំថ្ងៃ", back:"ត្រឡប់", search:"ស្វែងរក",
    filter:"តម្រង", allCategories:"គ្រប់ប្រភេទ", allMonths:"គ្រប់ខែ", previous:"មុន",
    profile:"គណនីរបស់ខ្ញុំ", changePassword:"ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
    currentPassword:"ពាក្យសម្ងាត់បច្ចុប្បន្ន", newPassword:"ពាក្យសម្ងាត់ថ្មី",
  }
};
export default translations;
