/**
 * Created by silasmartinez on 7/10/15.
 */
var input = document.getElementById("input");
var addSubButton = document.getElementById("button");
var nav = document.getElementById("nav");
var content = document.getElementById("content");

var parseDataTable = function() {
  var titleArray = JSON.parse(this.response).data.children;
  titleArray.forEach(function(elem, i) {

    var HTMLString = '';
    HTMLString += '<form action="/faves" method="POST">';
    HTMLString += '<input type="hidden" name="title" value="' + titleArray[i].data["title"] + '">';
    HTMLString += '<input type="hidden" name="url" value="' + titleArray[i].data["url"] + '">';
    HTMLString += '<button type="submit">Add To Faves</button>';
    HTMLString += '</form>';
    HTMLString += '<a href="' + titleArray[i].data["url"] + '">' + titleArray[i].data["title"] + '</a>';
    content.innerHTML += HTMLString;

    // '<a href="' + titleArray[i].data["url"] + '">' + titleArray[i].data["title"] + '</a>' +
    //   '<form action="/faves" method="POST">
    //     <input type="hidden" name="title" value="' + titleArray[i].data["title"] + '">
    //     <input type="hidden" name="url" value="' + titleArray[i].data["url"] + '">
    //     <button type="submit">Add To Faves</button>
    //   </form>';
  });
};

var localStorageString = function() {
  if (localStorage.getItem("reddit") === null) {
    var inputObject = {};
  }
  else {
    inputObject = JSON.parse(localStorage.getItem('reddit'));
  }
  inputObject[input.value] = input.value; //adds new properties to the object
  var result = JSON.stringify(inputObject);
  return result;
};

var makeNavButtons = function(subreddit) {
  // nav.innerHTML += "<button id=" + subreddit + ">" + subreddit + "</button>";
  // innerHTML += erases existing elements and creates identical elements, and erases existing event listeners but doesn't recreate them
  // instead use node.appendChild, or nav.appendChild in this case
  var navButton = document.createElement("button"); // createElement also gets Element By Id (returns the same type of thing)
  navButton.id = subreddit;
  navButton.innerHTML = subreddit; // safe to use innerHTML if it just destroys and creates text (content), not safe if innerHTML destoys and creates elements
  nav.appendChild(navButton);

  navButton.addEventListener('click', function () {
    content.innerHTML = "";
    var request = new XMLHttpRequest();
    request.open('GET', 'http://www.reddit.com/r/space.json');
    request.send();
    request.addEventListener('load', parseDataTable);
  });
};

window.addEventListener('load', function() { // when user clicks submit button
                                             // makeNavButtons(input.value);
  localStorage.setItem('reddit', localStorageString());
  content.innerHTML = "";
  var request = new XMLHttpRequest();
  request.open('GET', 'http://www.reddit.com/r/space.json');
  request.send();
  request.addEventListener('load', parseDataTable);
});

// window.addEventListener('load', function() { //makes buttons persist after refresh
//   if (localStorage.getItem("reddit") != null) { // Local storage object exists
//     inputObject = JSON.parse(localStorage.getItem('reddit'))
//     var inputArray = Object.keys(inputObject).map(function(k) { return inputObject[k] });
//     inputArray.forEach(makeNavButtons);
//   } // closes if
//   else { // No local storage object
//     console.log("Nothing in local storage.");
//   }
// });