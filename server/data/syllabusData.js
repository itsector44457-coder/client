// Prefilled syllabus for supported exams.
// Shape:
// {
//   [examCode]: [{ name: "Subject", topics: ["Topic A", "Topic B"] }]
// }

const SYLLABUS_DATA = {
  DSSSB: [
    {
      name: "Statistics & Probability",
      topics: [
        "Measures of Central Tendency",
        "Measures of Dispersion",
        "Probability Theory Basics",
        "Conditional Probability",
        "Bayes Theorem",
        "Random Variables",
        "Binomial and Poisson Distributions",
        "Normal Distribution",
        "Sampling Theory",
        "Hypothesis Testing",
        "ANOVA Basics",
        "Correlation and Regression",
      ],
    },
    {
      name: "Machine Learning",
      topics: [
        "Supervised vs Unsupervised Learning",
        "Linear Regression",
        "Logistic Regression",
        "Decision Trees",
        "Random Forest",
        "Support Vector Machines",
        "KNN",
        "K-Means Clustering",
        "PCA",
        "Model Evaluation Metrics",
        "Cross Validation",
        "Overfitting and Regularization",
      ],
    },
    {
      name: "Python Programming",
      topics: [
        "Python Fundamentals",
        "Functions and Modules",
        "OOP in Python",
        "NumPy",
        "Pandas",
        "Matplotlib and Seaborn",
        "File Handling",
        "Error Handling",
        "Regex Basics",
        "Scikit-learn Workflow",
      ],
    },
    {
      name: "SQL & Databases",
      topics: [
        "SQL Basics",
        "Joins",
        "Subqueries and CTEs",
        "Window Functions",
        "Aggregation and Grouping",
        "Indexing",
        "Normalization",
        "Transactions and ACID",
        "MongoDB Basics",
      ],
    },
    {
      name: "Data Analysis & Visualization",
      topics: [
        "EDA Process",
        "Data Cleaning",
        "Missing Value Handling",
        "Outlier Detection",
        "Feature Scaling",
        "Dashboard Design Basics",
        "A/B Testing Basics",
        "Business KPIs",
      ],
    },
    {
      name: "General Awareness (Tech)",
      topics: [
        "Digital India Mission",
        "AI in Governance",
        "Data Privacy Basics",
        "Cyber Security Current Affairs",
        "Open Government Data",
        "Latest Tech News",
      ],
    },
  ],

  NIC: [
    {
      name: "Computer Science Fundamentals",
      topics: [
        "Data Structures",
        "Algorithms and Complexity",
        "Operating Systems",
        "Computer Networks",
        "DBMS",
        "Software Engineering",
        "COA Basics",
        "Compiler Design Basics",
      ],
    },
    {
      name: "Data Science & Analytics",
      topics: [
        "Statistical Methods",
        "Machine Learning Algorithms",
        "Big Data Fundamentals",
        "Data Warehousing",
        "Data Mining",
        "NLP Basics",
        "Deep Learning Basics",
        "MLOps Basics",
      ],
    },
    {
      name: "Programming & Web Technologies",
      topics: [
        "Python Advanced",
        "Java Basics",
        "HTML CSS JavaScript",
        "REST APIs",
        "Git and Version Control",
        "Linux Commands",
        "Docker Basics",
        "Microservices Basics",
      ],
    },
    {
      name: "Cyber Security & Governance",
      topics: [
        "CIA Triad",
        "Cryptography Basics",
        "Network Security",
        "OWASP and Web Security",
        "IT Act Basics",
        "ISO 27001 Basics",
        "PKI and Digital Signatures",
        "Disaster Recovery",
      ],
    },
    {
      name: "Government IT Initiatives",
      topics: [
        "NIC Services",
        "DigiLocker",
        "UMANG",
        "India Stack",
        "Aadhaar Ecosystem",
        "UPI Architecture",
        "Open Data Portals",
        "National AI Strategy",
      ],
    },
  ],

  "IBPS IT": [
    {
      name: "IT Professional Knowledge",
      topics: [
        "Networking",
        "Cyber Security",
        "Cloud Computing",
        "Operating Systems",
        "DBMS",
        "Software Engineering",
        "Data Structures",
        "OOP Concepts",
      ],
    },
    {
      name: "Data Science for Banking",
      topics: [
        "Descriptive Statistics",
        "Predictive Analytics",
        "Fraud Detection Basics",
        "Customer Segmentation",
        "Classification Models",
        "Time Series Forecasting",
        "Model Evaluation",
      ],
    },
    {
      name: "Programming",
      topics: [
        "Python",
        "SQL",
        "Pandas",
        "NumPy",
        "API Basics",
        "Automation Scripts",
        "Exception Handling",
      ],
    },
    {
      name: "Banking Domain",
      topics: [
        "Digital Banking",
        "Core Banking Concepts",
        "KYC AML",
        "RBI Guidelines Basics",
        "Payment Systems",
        "Fintech Basics",
      ],
    },
    {
      name: "Quantitative Aptitude",
      topics: [
        "Number System",
        "Percentages",
        "Ratio and Proportion",
        "Profit and Loss",
        "Simple and Compound Interest",
        "Time Speed Distance",
        "Data Interpretation",
      ],
    },
    {
      name: "English",
      topics: [
        "Reading Comprehension",
        "Cloze Test",
        "Error Spotting",
        "Sentence Improvement",
        "Para Jumbles",
        "Vocabulary",
      ],
    },
  ],

  "UPSC Statistics": [
    {
      name: "Probability Theory",
      topics: [
        "Sample Space and Events",
        "Axioms of Probability",
        "Conditional Probability",
        "Bayes Theorem",
        "Random Variables",
        "Expectation and Variance",
        "MGF and Characteristic Function",
        "Standard Distributions",
        "Convergence in Distribution",
        "Law of Large Numbers",
        "Central Limit Theorem",
      ],
    },
    {
      name: "Statistical Inference",
      topics: [
        "Point Estimation",
        "Properties of Estimators",
        "Fisher Information",
        "Confidence Intervals",
        "Hypothesis Testing",
        "Likelihood Ratio Tests",
        "Non-parametric Tests",
        "Bayesian Inference",
        "Large Sample Theory",
      ],
    },
    {
      name: "Linear Models & Regression",
      topics: [
        "Simple Linear Regression",
        "Multiple Regression",
        "Gauss Markov Theorem",
        "Multicollinearity",
        "Heteroscedasticity",
        "Logistic Regression",
        "ANOVA",
        "ANCOVA",
        "Generalized Linear Models",
      ],
    },
    {
      name: "Sampling Theory",
      topics: [
        "Simple Random Sampling",
        "Stratified Sampling",
        "Systematic Sampling",
        "Cluster Sampling",
        "Multistage Sampling",
        "Ratio and Regression Estimation",
        "PPS Sampling",
        "Survey Design",
      ],
    },
    {
      name: "Design of Experiments",
      topics: [
        "Principles of DOE",
        "CRD and RBD",
        "Latin Square Design",
        "Factorial Designs",
        "Confounding",
        "Fractional Factorial",
        "Response Surface Methodology",
      ],
    },
    {
      name: "Multivariate Analysis",
      topics: [
        "Multivariate Normal Distribution",
        "Wishart Distribution",
        "Hotelling T-square",
        "MANOVA",
        "Principal Component Analysis",
        "Factor Analysis",
        "Discriminant Analysis",
        "Cluster Analysis",
      ],
    },
    {
      name: "Operations Research",
      topics: [
        "Linear Programming",
        "Duality",
        "Transportation Problem",
        "Assignment Problem",
        "Game Theory",
        "Network Analysis",
        "Inventory Models",
        "Queuing Theory",
        "Dynamic Programming",
      ],
    },
  ],

  MPPSC: [
    {
      name: "General Studies - History",
      topics: [
        "Ancient Indian History",
        "Medieval Indian History",
        "Modern Indian History",
        "Freedom Movement",
        "History of Madhya Pradesh",
      ],
    },
    {
      name: "General Studies - Polity",
      topics: [
        "Indian Constitution",
        "Fundamental Rights and Duties",
        "Directive Principles of State Policy",
        "Parliament and State Legislature",
        "Judiciary and Constitutional Bodies",
      ],
    },
    {
      name: "General Studies - Geography",
      topics: [
        "Physical Geography of India",
        "World Geography Basics",
        "Climate and Monsoon",
        "Natural Resources",
        "Geography of Madhya Pradesh",
      ],
    },
    {
      name: "General Studies - Economy",
      topics: [
        "Basic Economics",
        "Indian Economy Overview",
        "Budget and Fiscal Policy",
        "Banking and Inflation",
        "Economy of Madhya Pradesh",
      ],
    },
    {
      name: "General Studies - Science & Tech",
      topics: [
        "Basic Physics Chemistry Biology",
        "Environmental Ecology",
        "Space and Defence Tech",
        "Computer and IT Basics",
        "Current Science Affairs",
      ],
    },
    {
      name: "Current Affairs",
      topics: [
        "National Current Affairs",
        "International Current Affairs",
        "State Current Affairs (MP)",
        "Government Schemes",
        "Reports and Indices",
      ],
    },
    {
      name: "Aptitude & CSAT",
      topics: [
        "Comprehension",
        "Logical Reasoning",
        "Quantitative Aptitude",
        "Data Interpretation",
        "Decision Making",
      ],
    },
  ],
};

// Field-wise aliases (frontend field -> single syllabus code).
SYLLABUS_DATA["Data Science"] = SYLLABUS_DATA.DSSSB;
SYLLABUS_DATA.Coding = SYLLABUS_DATA.NIC;
SYLLABUS_DATA.Maths = SYLLABUS_DATA["UPSC Statistics"];

module.exports = SYLLABUS_DATA;
