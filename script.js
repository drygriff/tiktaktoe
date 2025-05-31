/* 

  Title: 
    Password Validator

  Program Summary: 
    A little mock TikTok with accounts stored locally, each with their own liked videos

  Important (KEY) Program Elements Used:
    - localStorage.setItem()
    - objects (factory function createAccount)
    - JSON.stringify() / JSON.parse()
    - .catch()
    - loop labels
    - Number() - to convert strings
    - Number.isNaN
    - Signle-line if statements
    - element.classlist.add()
    - clearInterval

  7-Part UI/UX:
    Title - in top left
    Welcome - first video
    Intro - second video
    Explanation - third video
    Re-iterate Input - password confirmation
    Output - password issues pop up above username input
    Thanks - thanks window pops up, as well as message on sidebar

  Authors:
    Dryden Griffin

  Version (Project Iteration):
    1.2.4

  Date (Last Edited):
    2024-05-29

*/



// Function Declarations





/*
Summary: Checks if a password is valid. Explicity using string traversal instead of regex or includes

@params: password/string
@return: [wasSuccessful/boolean, feedback/string]
*/
function validatePassword(password, username = null) {
  // Function-scoped variable declarations
  let containsLowercase = false;
  let containsUppercase = false;
  let containsNumber = false;
  let containsSpecial = false;


  if (password.length < 8) return [false, "Password must be at least 8 characters long"];
  if (password.length > 128) return [false, "Password cannot be longer than 128 characters"]


  if (password.toLowerCase().includes("password")) return [false, 'Password cannot include "password"'];
  if (password.toLowerCase().includes("qwerty")) return [false, 'Password cannot include "QWERTY"']


  if (username) {
    if (password.toLowerCase().includes(username.toLowerCase())) { // If username in password (case-insensitive)
      return [false, "Password cannot contain username"];
    } // END of if

    if (username.toLowerCase().includes(password.toLowerCase())) { // If password in username (case-insensitive)
      return [false, "Username cannot contain password"];
    } // END of if
  } // END of if username



  passwordLoop: for (let passwordIndex = 0; passwordIndex < password.length; passwordIndex++) {
    
    for (let alphaIndex = 0; alphaIndex < ALPHABET.length; alphaIndex++) { // Loop through alphabet and compare upper and lower
      if (password[passwordIndex] === ALPHABET[alphaIndex]) {
        containsLowercase = true;
        continue passwordLoop;
      } else if (password[passwordIndex] === UPPER_ALPHABET[alphaIndex]) {
        containsUppercase = true;
        continue passwordLoop;
      } // END of if-else-if
    } // END of alphabet for loop


    if ((password[passwordIndex] >= "0") && (password[passwordIndex] <= "9")) { // Compars char order values - just an alternate way to do it
      containsNumber = true;
      continue;
    } // END of digit NaN if statement


    if (password[passwordIndex] !== " ") { // If the char is not a letter, number, or space, then it is a special char
      containsSpecial = true;
    } // END of if special

  } // END of outer for loop

  if (!containsLowercase) {
    return [false, "Password must contain a lowercase letter"];
  } else if (!containsUppercase) {
    return [false, "Password must contain an uppercase letter"];
  } else if (!containsNumber) {
    return [false, "Password must contain a number"];
  } else if (!containsSpecial) {
    return [false, "Password must contain a special character"];
  } // END of if-else chain


  return [true, "Password Acceptable"];
} // END of function validatePassword





/*
Summary: A factory function for account objects

@params: newUsername/string, newPassword/string
@return: account object
*/
function createAccount(newPassword) {
  return {
    password: newPassword,
    likes: []
  }; // END of object
} // END of function createAccount





/*
Summary: Gets an account by name from local storage

@params: username/string
@return: account object
*/
function getAccount(username) {
  // Function-scoped variable declarations
  let accountList;

  if (username === null) {
    return null;
  } // END of if statement
  

  accountList = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));

  if ((!accountList) || (accountList[username] === undefined)) {
    return null;
  } // END of if statement

  return accountList[username];
} // END of function getAccount





/*
Summary: Saves an account to local storage

@params: username/string
@return: none
*/
function saveAccount(username, account) {
  // Function-scoped variable declarations
  let accountList = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));

  
  if (accountList === null) {
    accountList = {};
  } // END of if statement;

  accountList[username] = account;

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountList));
} // END of function saveAccount





/*
Summary: Moves the videos upward

@params: none
@return: none
*/
function scrollDown() {
  if (currentVideoIndex === (VIDEOS.length - 1)) {
    return;
  } // END of if statement

  currentVideoIndex += 1;
  updateScroll();
} // END of function scrollDown





/*
Summary: Moves the videos down

@params: none
@return: none
*/
function scrollUp() {
  if (currentVideoIndex === 0) {
    return;
  } // END of if statement

  currentVideoIndex -= 1;
  updateScroll();
} // END of function scrollUp





/*
Summary: Pauses current video

@params: none
@return: none
*/
function togglePause() {
  if (VIDEOS[currentVideoIndex].paused) {
    PAUSE_INDICATOR.src = "play.svg";
    VIDEOS[currentVideoIndex].play();
  } else {
    PAUSE_INDICATOR.src = "pause.svg";
    VIDEOS[currentVideoIndex].pause();
  } // END of if else

  // Apply an animation to the pause thingy
  PAUSE_INDICATOR.classList.remove("fade-animation");
  PAUSE_INDICATOR.getBoundingClientRect() // Forces it to reload so the animation applies
  PAUSE_INDICATOR.classList.add("fade-animation");
} // END of function togglePause






/*
Summary: Updates the videos' position

@params: none
@return: none
*/
function updateScroll() {
  // Function-scoped variable declarations
  let couldUnmute = true;



  if (VIDEOS.length === 0) {
    console.error("missing videos");
    return;
  } // END of if statement


  currentVideoIndex = Math.max( Math.min(currentVideoIndex, (VIDEOS.length - 1)) , 0); // Clamp current video to possible posts

  for (let i = 0; i < VIDEOS.length; i++) { // Play the new current video, pause and mute everything else
    VIDEOS[i].getElementsByTagName('video')[0];


    if (i === currentVideoIndex) {
      VIDEOS[i].currentTime = 0;

      VIDEOS[i].muted = false;
      VIDEOS[i].play().catch(function() {// Sometimes the browser doesn't let unpause happen even when a key is pressed (like with keyboard shortcuts), so this is needed
        console.warn("User pressed a key that was ignored by the browser. Didn't play video.") // Make it clear that nothing needs fixing
        VIDEOS[i].muted = true;
        VIDEOS[i].pause();
        couldUnmute = false;
      }); // END of catch
      
    } else {
      VIDEOS[i].muted = true;
      VIDEOS[i].pause();
    } // END of if-else
  } // END of for loop

  INNER_FEED_ELEMENT.style.top = `${-100*currentVideoIndex}%`

  setTimeout(function () { // Allow the VIDEOS[i].play().catch() to run first (if it runs at all)

    if ((couldUnmute) && (!didUnmute)) {
      for (let eventName of INTERACTION_EVENTS) { // Remove the event listeners that wait for the broswer to let unmute video
        document.removeEventListener(eventName, updateScroll);
      } // END of for loop

      didUnmute = true;
    } // END of if
  }, 0); // END of setTimeout
  

} // END of function updateScroll





/*
Summary: Sets up the videos with appropriate buttons

@params: none
@return: none
*/
function initializeVideos() {
  // Function-scoped variable declarations
  let initialAccount = getAccount(currentUsername);


  if (initialAccount) {
    SIGN_WINDOW_BUTTON.innerText = "Sign Out";
  } // END of if statement


  for (let i = 0; i < POSTS.length; i++) {
    // Loop-scoped variable declarations (for event listener reasons)
    let likeButton = document.createElement("button");
    let heartImg = document.createElement("img");
    let postIndex = i;


    likeButton.classList.add("like-button");
    likeButton.appendChild(heartImg);

    if ((initialAccount !== null) && (initialAccount.likes.includes(postIndex))) {
      heartImg.src = "red-heart.svg";
    } else {
      heartImg.src = "white-heart.svg";
    } // END of if-else

    POSTS[i].appendChild(likeButton);


    // Event listener function
    likeButton.addEventListener("click", function() {
      // (Event listener) Function-scoped variable declarations
      let currentAccount = getAccount(currentUsername);
      let likeIndex;


      if(currentAccount === null) {
        openSignInWindow();
        return;
      }

      likeIndex = currentAccount.likes.indexOf(postIndex)

      if (likeIndex !== -1) { // THIS IS WHERE I STOPPED. FORGOT HOW TO CHECK IF ARRAY CONTAINED VALUE
        heartImg.classList.remove("liked");
        heartImg.src = "white-heart.svg";
        currentAccount.likes.splice(likeIndex, 1);
      } else {
        heartImg.classList.add("liked");
        heartImg.src = "red-heart.svg";
        currentAccount.likes.push(postIndex);
      } // END of if-else

      saveAccount(currentUsername, currentAccount)
    }); // END of event listener

  } // END of for loop
} // END of function initializeVideos





/*
Summary: Hides the window when clicked outside.

@params: clickEvent/event
@return: none
*/
function hideOnClickOutside(clickEvent) { // If clicked outside the window, close it
  if (!(SIGN_WINDOW.contains(clickEvent.target))) {
    SIGN_WINDOW.classList.add("hidden");
    document.removeEventListener("mousedown", hideOnClickOutside);
  } // END of if statement
} // END of function hideOnClickOutside





/*
Summary: Opens the sign-in window

@params: none
@return: none
*/
function openSignInWindow() {
  SIGN_WINDOW.classList.remove("hidden");
  
  THANK_YOU_DIV.classList.add("hidden")
  SIGN_UP_DIV.classList.add("hidden");
  SIGN_IN_DIV.classList.remove("hidden");


  LOGIN_FEEDBACK.classList.remove("success");
  LOGIN_FEEDBACK.classList.remove("failure");

  if (!(VIDEOS[currentVideoIndex].paused)) {
    togglePause();
  } // END of if statement


  document.removeEventListener("mousedown", hideOnClickOutside); // To avoid overlap
  clearTimeout(thankyouTimeout);

  setTimeout(function() { // Avoids instant exit
    document.addEventListener("mousedown", hideOnClickOutside);
  }, 100); // END of setTimeout
} // END of function openSignInWindow





/*
Summary: Opens the sign-in window

@params: none
@return: none
*/
function openSignUpWindow() {
  SIGN_WINDOW.classList.remove("hidden");

  THANK_YOU_DIV.classList.add("hidden");
  SIGN_IN_DIV.classList.add("hidden");
  SIGN_UP_DIV.classList.remove("hidden");


  REGISTER_FEEDBACK.classList.remove("success");
  REGISTER_FEEDBACK.classList.remove("failure");

  if (!(VIDEOS[currentVideoIndex].paused)) {
    togglePause();
  } // END of if statement


  document.removeEventListener("mousedown", hideOnClickOutside); // To avoid overlap
  clearTimeout(thankyouTimeout);

  setTimeout(function() { // Avoids instant exit
    document.addEventListener("mousedown", hideOnClickOutside);
  }, 100); // END of setTimeout
} // END of function openSignUpWindow





/*
Summary: Handles key press events and calls appropriate functions.

@params: event
@return: none
*/
function handleKeyPress(event) {

  if (SIGN_WINDOW.contains(event.target)) { // Ignore if the user is typing or something in the login screen
    return;
  } // END of if statement

  switch(event.key) {
    case "ArrowUp":
      scrollUp();
      break;
    case "ArrowDown":
      scrollDown();
      break;
    case " ":
      togglePause();
      break;
    case "F9": // For debugging
      console.log("Account name: " + currentUsername);
      console.log("Current account: ", getAccount(currentUsername));
      console.log("All accounts: ", JSON.parse(localStorage.getItem(ACCOUNTS_KEY)));
      break;
  } // END of switch statement

} // END of function handleKeyPress





/*
Summary: Handles mouse wheel events and calls appropriate functions.

@params: event
@return: none
*/
function handleWheelScroll(event) {
  // Function-scoped variables
  let currentTime = Date.now();


  if (((currentTime - lastScrollTime) < SCROLL_COOLDOWN) || (!didUnmute)) { // Put scrolling on cooldown
    return;
  } // END of if statement
  lastScrollTime = currentTime;

  if (event.deltaY > 0) {
    scrollDown();
  } else {
    scrollUp();
  } // END of if-else

} // END of function handleWheelScroll





/*
Summary: Attempts to login. Returns true if successful, false if not.

@params: username/string password/string
@return: [wasSuccessful/boolean, feedback/string]
*/
function attemptLogin(username, password, newAccount = false) {
  // Function-scoped variable declarations
  let account = getAccount(username);
  let heartImg;


  if (!newAccount) { // If likes !== null, sign-in was already confirmed
    if (!account) {
      return [false, "Account does not exist"];
    } // END of first inner if

    if (password != account.password) {
      return [false, "Incorrect password"];
    } // END of second inner if
  }// END of outer if statement


  currentUsername = username; // Set the current account
  localStorage.setItem(LOGGED_IN_USERNAME_KEY, currentUsername);
  SIGN_WINDOW_BUTTON.innerText = "Sign Out";


  for (let i = 0; i < POSTS.length; i++) { // Update like buttons
    heartImg = POSTS[i].querySelector("button.like-button img");

    if ((!newAccount) && account.likes.includes(i)) {
      heartImg.src = "red-heart.svg";
    } else {
      heartImg.src = "white-heart.svg";
    } // END of if-else

  } // END of for loop


  return [true, "Login Successful"];
} // END of function attemptLogin





/*
Summary: Creates a new account and logs in.

@params: none
@return: none
*/
function registerAccount() {
  // Function-scoped variables
  let newUsername = USERNAME_REGISTER_INPUT.value;
  let newPassword = PASSWORD_REGISTER_INPUT.value;
  let passwordConfirmation = PASSWORD_REGISTER_CONFIRMATION.value;
  let newAccount;
  let passwordValidationResult;
  let isPasswordValid;
  let passwordFeedback;
  

  REGISTER_FEEDBACK.classList.remove("success");
  REGISTER_FEEDBACK.classList.remove("failure");
  REGISTER_FEEDBACK.getBoundingClientRect() // Forces it to reload so the transition applies


  if (!(newUsername)) { // if username not entered
    REGISTER_FEEDBACK.innerText = "Missing username";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (newUsername.length < 3) { // if username not entered
    REGISTER_FEEDBACK.innerText = "Username too short";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (newUsername.length > 32) { // if username not entered
    REGISTER_FEEDBACK.innerText = "Username too long";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (getAccount(newUsername) !== null) { // if account already exists
    REGISTER_FEEDBACK.innerText = "Account name already in use";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (!(newPassword)) { // if password not entered
    REGISTER_FEEDBACK.innerText = "Missing password";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (!(passwordConfirmation)) { // if password confirmation not entered
    REGISTER_FEEDBACK.innerText = "Missing password confirmation";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement

  if (passwordConfirmation !== newPassword) { // if password confirmation not entered
    REGISTER_FEEDBACK.innerText = "Confirmation does not match password";
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement


  passwordValidationResult = validatePassword(newPassword, newUsername);
  isPasswordValid = passwordValidationResult[0];
  passwordFeedback = passwordValidationResult[1];


  if (isPasswordValid === false) {
    REGISTER_FEEDBACK.innerText = passwordFeedback;
    REGISTER_FEEDBACK.classList.add("failure");
    return;
  } // END of if statement
  

  newAccount = createAccount(newPassword);
  saveAccount(newUsername, newAccount);

  attemptLogin(newUsername, newPassword, true);

  
  REGISTER_FEEDBACK.innerText = "Registration Successful";
  REGISTER_FEEDBACK.classList.add("success");
  openThanksWindow("Thank you for signing up, " + newUsername);
} // END of function registerAccount





/*
Summary: Called by button onclick. Attempts login with given stuff in the inputs

@params: none
@return: none
*/
function loginButton() {
  // Function-scoped variable declarations
  let attemptResult = attemptLogin(USERNAME_LOGIN_INPUT.value, PASSWORD_LOGIN_INPUT.value); // returns two values
  let didLogin = attemptResult[0];
  let feedbackMessage = attemptResult[1];


  LOGIN_FEEDBACK.innerText = feedbackMessage;

  
  LOGIN_FEEDBACK.classList.remove("success");
  LOGIN_FEEDBACK.classList.remove("failure");
  LOGIN_FEEDBACK.getBoundingClientRect() // Forces it to reload so the transition applies


  if (didLogin) {
    LOGIN_FEEDBACK.classList.add("success");
    openThanksWindow("Thank you for signing in, " + USERNAME_LOGIN_INPUT.value);
  } else {
    LOGIN_FEEDBACK.classList.add("failure");
  } // END of if-else

} // END of function loginButton





/*
Summary: Called by button onclick. Attempts login with given stuff in the inputs

@params: none
@return: none
*/
function signWindowButton() {

  if (currentUsername === null) {
    openSignInWindow();
  } else {
    currentUsername = null;
    localStorage.removeItem(LOGGED_IN_USERNAME_KEY);
    SIGN_WINDOW_BUTTON.innerText = "Sign In";
    THANK_YOU_SIDEBAR.innerText = "";

    for (let i = 0; i < POSTS.length; i++) { // Update like buttons
      heartImg = POSTS[i].querySelector("button.like-button img");
      heartImg.src = "white-heart.svg";
    } // END of for loop

  } // END of if-else


} // END of function signWindowButton





/*
Summary: Opens the thanks window after a delay, then closes the window

@params: none
@return: none
*/
function openThanksWindow(message) {

  setTimeout(function() {
    SIGN_IN_DIV.classList.add("hidden");
    SIGN_UP_DIV.classList.add("hidden");

    THANK_YOU_SIDEBAR.innerText = message;
    THANK_YOU_ELEMENT.innerText = message;
    THANK_YOU_DIV.classList.remove("hidden");
  }, 1000); // END of delay setTimeout


  thankyouTimeout = setTimeout(
    function() {
      SIGN_WINDOW.classList.add("hidden");
    },
  10000); // END of duration setTimeout


} // END of function openThanksWindow






//Beginning of program


// Global Variable Declarations

const INTERACTION_EVENTS = ["click", "touchstart", "keydown", "mousedown", "pointerdown"];
const SCROLL_COOLDOWN = 700; // Time in ms between detecting scroll inputs

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const UPPER_ALPHABET = ALPHABET.toUpperCase();
// DONT FORGET WELCOME, INTRO, & EXPLANATION
// Maybe add videos via src link instead of local file to save space?? Might not be able to find any.
// Perhaps download youtube shorts or something

const ACCOUNTS_KEY = "accounts";
const LOGGED_IN_USERNAME_KEY = "loggedInUser";

let currentVideoIndex = 0;
let didUnmute = false;
let lastScrollTime = 0;
let currentUsername = localStorage.getItem(LOGGED_IN_USERNAME_KEY);
let thankyouTimeout = null;

// DOM Elements

const INNER_FEED_ELEMENT = document.getElementById("inner-feed");
const PAUSE_INDICATOR = document.getElementById("pause-indicator");

const POSTS = INNER_FEED_ELEMENT.getElementsByClassName("post");
const VIDEOS = INNER_FEED_ELEMENT.querySelectorAll(".post video");

const SIGN_WINDOW = document.getElementById("sign-window");
const SIGN_WINDOW_BUTTON = document.getElementById("sign-in-window-button");
const SIGN_IN_DIV = document.getElementById("sign-in");
const SIGN_UP_DIV = document.getElementById("sign-up");

const USERNAME_LOGIN_INPUT = document.getElementById("username-login-input");
const PASSWORD_LOGIN_INPUT = document.getElementById("password-login-input");
const LOGIN_FEEDBACK = document.getElementById("login-feedback");

const USERNAME_REGISTER_INPUT = document.getElementById("username-register-input");
const PASSWORD_REGISTER_INPUT = document.getElementById("password-register-input");
const PASSWORD_REGISTER_CONFIRMATION = document.getElementById("password-register-confirmation");
const REGISTER_FEEDBACK = document.getElementById("register-feedback");

const THANK_YOU_DIV = document.getElementById("pop-thank-you");
const THANK_YOU_ELEMENT = document.getElementById("thank-you-text");
const THANK_YOU_SIDEBAR = document.getElementById("thank-you-sidebar");

// Event Listeners



document.addEventListener('keyup', handleKeyPress);

document.addEventListener("wheel", handleWheelScroll);


for (let eventName of INTERACTION_EVENTS) { // Start video once user interacts with screen (broswers don't let you unmute otherwise)
  document.addEventListener(eventName, updateScroll);
} // END of for loop

for (let i = 0; i < VIDEOS.length; i++) { // Make clicking on video pause/unpause
  VIDEOS[i].addEventListener('pointerdown', togglePause);
} // END of for loop




// Beginning of Main

initializeVideos(); // Set up like buttons and stuff


// End of Main



// End of Program




/*

NOTES:
-


TEST CODE:
-

*/