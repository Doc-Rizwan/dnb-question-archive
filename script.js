let excelData = []; // Will store the Google Sheets data

// Define sub topics for each main topic
const subTopics = {
    cardiology: [
        "Coronary Artery Disease",
        "Heart Failure",
        "Arrhythmias",
        "Valvular Heart Disease",
        "Hypertension"
    ],
    neurology: [
        "Stroke",
        "Epilepsy",
        "Movement Disorders",
        "Multiple Sclerosis",
        "Headache"
    ],
    endocrinology: [
        "Diabetes",
        "Thyroid Disorders",
        "Adrenal Disorders",
        "Pituitary Disorders",
        "Metabolic Disorders"
    ],
    respiratory: [
        "Asthma",
        "COPD",
        "Pneumonia",
        "Tuberculosis",
        "Lung Cancer"
    ]
};

// Sample question data with sub topics
const questions = [
    {
        id: 1,
        year: "2023",
        topic: "cardiology",
        subTopic: "Coronary Artery Disease",
        question: "Which of the following is the most common cause of Acute Coronary Syndrome?",
        options: [
            "Plaque rupture",
            "Coronary vasospasm",
            "Cocaine use",
            "Coronary embolism"
        ],
        correctAnswer: 0,
        explanation: "Plaque rupture is the most common cause of ACS"
    },
    // Add more questions here
];

// DOM elements
const yearFilter = document.getElementById('yearFilter');
const topicFilter = document.getElementById('topicFilter');
const subTopicFilter = document.getElementById('subTopicFilter');
const questionsContainer = document.getElementById('questionsContainer');

// Update sub topics based on main topic selection
function updateSubTopics() {
    const selectedTopic = topicFilter.value;
    subTopicFilter.innerHTML = '<option value="all">All Sub Topics</option>';
    
    if (selectedTopic !== 'all' && excelData.length > 0) {
        // Get the column names
        const topicColumnName = Object.keys(excelData[0])[3]; // 4th column
        const subTopicColumnName = Object.keys(excelData[0])[4]; // 5th column
        
        // Filter sub-topics based on selected topic
        const filteredSubTopics = [...new Set(excelData
            .filter(item => {
                const itemTopic = item[topicColumnName]?.toString().toLowerCase().replace(/[^a-z0-9]/g, '_');
                return itemTopic === selectedTopic;
            })
            .map(item => item[subTopicColumnName])
            .filter(Boolean) // Remove null/undefined
            .map(subTopic => subTopic.toString().trim())
            .filter(subTopic => subTopic !== ''))] // Remove empty strings
            .sort();
        
        // Add filtered sub-topics to dropdown
        filteredSubTopics.forEach(subTopic => {
            const option = document.createElement('option');
            const displayText = subTopic;
            const value = subTopic.toString().toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            option.value = value;
            option.textContent = displayText;
            subTopicFilter.appendChild(option);
        });
    }
    
    filterQuestions();
}

// Update Filter questions function
function filterQuestions() {
    try {
        const selectedYear = yearFilter.value;
        const selectedTopic = topicFilter.value;
        const selectedSubTopic = subTopicFilter.value;

        // If all filters are set to 'all', display all questions
        if (selectedYear === 'all' && selectedTopic === 'all' && selectedSubTopic === 'all') {
            displayQuestions(excelData);
            return;
        }

        const filteredQuestions = excelData.filter(q => {
            const yearMatch = selectedYear === 'all' || q[Object.keys(excelData[0])[0]] === selectedYear;
            const topicMatch = selectedTopic === 'all' || q[Object.keys(excelData[0])[3]].toString().toLowerCase().replace(/[^a-z0-9]/g, '_') === selectedTopic;
            const subTopicMatch = selectedSubTopic === 'all' || q[Object.keys(excelData[0])[4]].toString().toLowerCase().replace(/[^a-z0-9]/g, '_') === selectedSubTopic;

            return yearMatch && topicMatch && subTopicMatch;
        });

        displayQuestions(filteredQuestions);
    } catch (error) {
        console.error('Error filtering questions:', error);
        alert('Error filtering questions. Please try again.');
    }
}

// Update display questions function
function displayQuestions(questionsToShow) {
    questionsContainer.innerHTML = '';
    
    questionsToShow.forEach(q => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        // Get column values from Excel data
        const column1Value = q[Object.keys(excelData[0])[0]]; // First column (Year)
        const column6Value = q[Object.keys(excelData[0])[5]]; // Sixth column (Question)
        
        questionCard.innerHTML = `
            <div class="question-text">
                <p>${column6Value}</p>
            </div>
            <div class="year-tag">
                <span>${column1Value}</span>
            </div>
        `;
        
        questionsContainer.appendChild(questionCard);
    });
}

// Event listeners
yearFilter.addEventListener('change', filterQuestions);
topicFilter.addEventListener('change', updateSubTopics);
subTopicFilter.addEventListener('change', filterQuestions);

// Initial setup
updateSubTopics();

// Function to fetch data from Google Sheets
async function fetchData() {
    const sheetID = '1BdPa8OzimTsj3UruekG0guU57lARJ66PoA6dC_w52TQ'; // Yahan apna Google Sheet ID daalein
    const apiKey = 'AIzaSyCL-CtAL9_tKbqpK4aVw2q_9lzsFK_Rjfo'; // Yahan apna Google API Key daalein
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Sheet1?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data:', data); // Data ko console par dekhne ke liye

        // Process the data and display it
        excelData = data.values; // Assuming your data is in the first sheet
        displayQuestions(excelData); // Call your function to display questions

        // Populate filters with the new data
        populateYearFilter();
        populateTopicFilter();
        populateSubTopicFilter();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the fetchData function when the page loads
window.addEventListener('DOMContentLoaded', fetchData);

// Function to get unique years from the first column
function getUniqueYears() {
    if (!excelData.length) return [];
    
    const yearColumnName = Object.keys(excelData[0])[0]; // Assuming first column is year
    const uniqueYears = [...new Set(excelData.map(item => item[yearColumnName]))];
    
    // Filter out "Year" and "Month" headers
    const filteredYears = uniqueYears.filter(year => year && year.trim() !== "Year" && year.trim() !== "Month").sort((a, b) => b - a); // Remove empty, "Year", and "Month", and sort in descending order
    console.log('Unique Years:', filteredYears);
    return filteredYears;
}

// Function to get unique topics from the fourth column
function getUniqueTopics() {
    if (!excelData.length) return [];
    
    const topicColumnName = Object.keys(excelData[0])[3]; // Getting 4th column name
    const uniqueTopics = [...new Set(excelData.map(item => item[topicColumnName]))];
    return uniqueTopics.filter(topic => topic).sort(); // Remove empty topics and sort alphabetically
}

// Function to get unique sub-topics from the fifth column
function getUniqueSubTopics() {
    if (!excelData.length) return [];
    
    const subTopicColumnName = Object.keys(excelData[0])[4]; // Getting 5th column name
    const uniqueSubTopics = [...new Set(excelData.map(item => item[subTopicColumnName]))];
    return uniqueSubTopics.filter(subTopic => subTopic).sort(); // Remove empty sub-topics and sort alphabetically
}

// Update populateYearFilter function
function populateYearFilter() {
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="all">All Years</option>'; // Keep this option if you want to allow all years

    // Get unique years without "Year" and "Month"
    const uniqueYears = getUniqueYears();

    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Update populateTopicFilter function
function populateTopicFilter() {
    const topicFilter = document.getElementById('topicFilter');
    topicFilter.innerHTML = '<option value="all">All Topics</option>';
    
    getUniqueTopics().forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.toString().toLowerCase().replace(/[^a-z0-9]/g, '_');
        option.textContent = topic; // Keep original text for display
        topicFilter.appendChild(option);
    });
}

// Update populateSubTopicFilter function
function populateSubTopicFilter() {
    const subTopicFilter = document.getElementById('subTopicFilter');
    subTopicFilter.innerHTML = '<option value="all">All Sub Topics</option>';
    
    getUniqueSubTopics().forEach(subTopic => {
        const option = document.createElement('option');
        option.value = subTopic.toString().toLowerCase().replace(/[^a-z0-9]/g, '_');
        option.textContent = subTopic; // Keep original text for display
        subTopicFilter.appendChild(option);
    });
}

// Update Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const activeContent = document.querySelector('.tab-content.active');
            const tabId = tab.getAttribute('data-tab');
            const newContent = document.getElementById(tabId + 'Tab');

            // Don't animate if clicking the same tab
            if (activeContent === newContent) return;

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Animate out current content
            activeContent.classList.add('fade-out');
            
            // After animation out, switch content and animate in
            setTimeout(() => {
                activeContent.classList.remove('active', 'fade-out');
                newContent.classList.add('active', 'fade-in');
                
                // Remove animation classes after completion
                setTimeout(() => {
                    newContent.classList.remove('fade-in');
                }, 500);
            }, 300);
        });
    });
});

// Add this function to populate important topics
function populateImportantTopics() {
    const topicList = document.querySelector('.topic-list');
    const importantTopics = [
        {
            title: "Cardiology",
            subtopics: [
                "Acute Coronary Syndrome",
                "Heart Failure",
                "Hypertension"
            ]
        },
        {
            title: "Neurology",
            subtopics: [
                "Stroke",
                "Seizures",
                "Headache"
            ]
        },
        // Add more topics as needed
    ];

    importantTopics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.innerHTML = `
            <h3>${topic.title}</h3>
            <ul>
                ${topic.subtopics.map(sub => `<li>${sub}</li>`).join('')}
            </ul>
        `;
        topicList.appendChild(topicCard);
    });
}

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', populateImportantTopics);
