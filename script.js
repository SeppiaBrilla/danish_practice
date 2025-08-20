// Word data structure
let words = [];
let currentWord = null;

// DOM Elements
const danishWordEl = document.getElementById('danishWord');
const englishTranslationEl = document.getElementById('englishTranslation');
const showTranslationBtn = document.getElementById('showTranslation');
const nextWordBtn = document.getElementById('nextWord');
const playAudioBtn = document.getElementById('playAudio');
const audioPlayer = document.getElementById('audioPlayer');
const randomModeBtn = document.getElementById('randomMode');
const listModeBtn = document.getElementById('listMode');
const randomWordSection = document.getElementById('randomWordSection');
const wordListSection = document.getElementById('wordListSection');
const wordListEl = document.getElementById('wordList');
const searchInput = document.getElementById('searchInput');

// Load words from CSV
async function loadWords() {
    try {
        const response = await fetch('./words.csv');
        const csvData = await response.text();
        
        // Parse CSV
        const lines = csvData.split('\n');
        words = [];
        
        // Skip header row and process each line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle CSV parsing (simple split by comma, but be careful with quoted values)
            const parts = line.split(',');
            if (parts.length >= 3) {
                // Remove quotes if present and trim
                const danish = parts[1].replace(/^"|"$/g, '').trim();
                const english = parts[2].replace(/^"|"$/g, '').trim();
                
                // Only add if we have both words and an audio file exists
                if (danish && english) {
                    words.push({
                        danish: danish,
                        english: english,
                        audioFile: `${danish.charAt(0).toUpperCase() + danish.slice(1)}.mp3`
                    });
                }
            }
        }
        
        console.log(`Loaded ${words.length} words`);
        
        // Initialize the app
        showRandomWord();
        populateWordList();
        
    } catch (error) {
        console.error('Error loading words:', error);
        danishWordEl.textContent = 'Error loading words. Please check console for details.';
    }
}

// Show a random word
function showRandomWord() {
    if (words.length === 0) return;
    
    // Get a random word
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    
    // Update UI
    danishWordEl.textContent = currentWord.danish;
    englishTranslationEl.textContent = '';
    englishTranslationEl.classList.add('hidden');
    
    // Preload audio
    preloadAudio(currentWord.audioFile);
}

// Preload audio file
function preloadAudio(audioFile) {
    // Set the audio source
    audioPlayer.src = `output_words/${audioFile.toLowerCase()}`;
    
    // Handle case when audio file doesn't exist
    audioPlayer.onerror = () => {
        console.warn(`Audio file not found: ${audioFile}`);
        playAudioBtn.disabled = true;
    };
    
    // Reset button state when audio is ready
    audioPlayer.oncanplay = () => {
        playAudioBtn.disabled = false;
    };
}

// Play the current word's audio
function playAudio() {
    if (!currentWord) return;
    
    try {
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

// Show the translation
function showTranslation() {
    if (!currentWord) return;
    englishTranslationEl.textContent = currentWord.english;
    englishTranslationEl.classList.remove('hidden');
}

// Populate word list
function populateWordList(searchTerm = '') {
    if (!wordListEl) return;
    
    // Clear current list
    wordListEl.innerHTML = '';
    
    // Filter words based on search term (case insensitive)
    const filteredWords = searchTerm 
        ? words.filter(word => 
            word.danish.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.english.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : words;
    
    // Add words to the list
    filteredWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div class="word-danish">${word.danish}</div>
            <div class="word-english">${word.english}</div>
        `;
        
        // Play audio and show word when clicked
        wordItem.addEventListener('click', () => {
            // Switch to random word mode
            randomWordSection.classList.remove('hidden');
            wordListSection.classList.add('hidden');
            randomModeBtn.classList.add('active');
            listModeBtn.classList.remove('active');
            
            // Show the selected word
            currentWord = word;
            danishWordEl.textContent = currentWord.danish;
            englishTranslationEl.textContent = '';
            englishTranslationEl.classList.add('hidden');
            preloadAudio(currentWord.audioFile);
        });
        
        wordListEl.appendChild(wordItem);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadWords);

showTranslationBtn.addEventListener('click', showTranslation);
nextWordBtn.addEventListener('click', showRandomWord);
playAudioBtn.addEventListener('click', playAudio);

// Mode switching
randomModeBtn.addEventListener('click', () => {
    randomWordSection.classList.remove('hidden');
    wordListSection.classList.add('hidden');
    randomModeBtn.classList.add('active');
    listModeBtn.classList.remove('active');
    
    // Show a new random word when switching to random mode
    showRandomWord();
});

listModeBtn.addEventListener('click', () => {
    randomWordSection.classList.add('hidden');
    wordListSection.classList.remove('hidden');
    listModeBtn.classList.add('active');
    randomModeBtn.classList.remove('active');
    
    // Focus the search input when switching to list mode
    searchInput.focus();
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    populateWordList(e.target.value);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to show/hide translation in random mode
    if (e.code === 'Space' && !randomWordSection.classList.contains('hidden')) {
        e.preventDefault();
        if (englishTranslationEl.classList.contains('hidden')) {
            showTranslation();
        } else {
            showRandomWord();
        }
    }
    
    // N for next word in random mode
    if (e.code === 'KeyN' && !randomWordSection.classList.contains('hidden')) {
        showRandomWord();
    }
    
    // P to play audio in random mode
    if (e.code === 'KeyP' && !randomWordSection.classList.contains('hidden')) {
        playAudio();
    }
    
    // 1 to switch to random mode
    if (e.code === 'Digit1') {
        randomModeBtn.click();
    }
    
    // 2 to switch to list mode
    if (e.code === 'Digit2') {
        listModeBtn.click();
    }
});
