$(document).ready(function () {
  console.log("Hello World");
  var selectOption = $("#selectOption");
  var submitForm = $("#submit-form");
  var searchBar = $("#searchField");
  var sevenDay = $("#sevenDayDisplay")
  var sevenDayDiv = $("#sevenDayDiv")
  var apiKey = "cf002751564a4c78f5f7ed479f1b9ba3";
  var storedCities = JSON.parse(sessionStorage.getItem("history")) || [];
  // Function Definitions

  //Clears setInterval function
  function clearAlertInterval(alert){
    clearInterval(alert);
  }
  //   Grabs UV Information based off of lat and lon gathered from the City Search - Nests in populateCities Function
  function getUVIndex(lat, lon) {
    var queryUrl =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      apiKey +
      "&units=imperial";
    $.ajax({
      url: queryUrl,
      method: "GET",
    }).then(function (response) {
      sevenDayForecast(response);
      console.log(response);
      var uV = response.current.uvi;
      $("#responseUVIndex").text(uV);
    });
  }

  //  Grabs Seven Day Forecast and Creates Cards for each day - Nests inside UV Function
  function sevenDayForecast(response) {
    sevenDayDiv.show();
    sevenDay.empty();
    for (var i = 1; i < 8; i++) {
      var newDay = response.daily[i];
      var newDate = moment().add(i, "days").format("L");
      var dayOfWeek = moment().add(i, "days").format("dddd");
      var newCard = $(
        '<div class="card text-white bg-primary" style="max-width: 16rem; display: inline-block"></div>'
      );
      newCard.append("<div class='card-header'>" + newDate + "</div>");
      newCard.append("<div class='card-header'>" + dayOfWeek + "</div>");
      newCard.append(
        $(
          '<img class="images" src ="https://openweathermap.org/img/wn/' +
            newDay.weather[0].icon +
            '.png"/>'
        )
      );
      newCard
        .append('<div class="card-body"></div>')
        .append(
          '<p class="card-title">' +
            Math.floor(newDay.temp.min) +
            String.fromCharCode(176) +
            "/" +
            Math.ceil(newDay.temp.max) +
            String.fromCharCode(176) +
            "</p>"
        )
        .append(
          '<p class="card-text">' +
            "Humidity: " +
            newDay.humidity +
            "%" +
            "</p>"
        );

      sevenDay.append(newCard);
    }
  }

  //Function To Populate Search Data - Nests in each of the API functions
  function populateCityData(response) {
    $("#city-name")
      .text("" + response.name + " (" + moment().format("L") + ")")
      .append(
        $(
          '<img id="currentImage" src ="https://openweathermap.org/img/wn/' +
            response.weather[0].icon +
            '.png"/>'
        )
      );
    $("#temp").text(
      "Current Temp: " +
        Math.ceil(response.main.temp) +
        String.fromCharCode(176) +
        "F"
    );
    $("#responseLowTemp").text(
      Math.ceil(response.main.temp_min) + String.fromCharCode(176) + "F"
    );
    $("#responseHighTemp").text(
      Math.ceil(response.main.temp_max) + String.fromCharCode(176) + "F"
    );
    $("#responseFeelsLike").text(
      Math.ceil(response.main.feels_like) + String.fromCharCode(176) + "F"
    );
    $("#responseHumid").text(response.main.humidity + "%");
    $("#responseWindSpeed").text(response.wind.speed + " MPH");
    getUVIndex(response.coord.lat, response.coord.lon);
  }

  // Creates Buttons for quick search based off of search history - Nests in each of the API functions
  function cityButtons(response) {
    var cityHistory = [];
    if (storedCities.indexOf(response.name) === -1) {
      cityHistory.push(response.name);
      storedCities.unshift(response.name);
      sessionStorage.setItem("history", JSON.stringify(storedCities));
    }
    searchBar.val("");
    for (var i = 0; i < cityHistory.length; i++) {
      var newDiv = $("<div>");
      newDiv.append(
        $(
          "<button type='button' class='btn btn-light cityButton my-1 py-3 text-start col-sm-9'>" +
            cityHistory[i] +
            "</button>"
        )
      );
      $("#savedCities").prepend(newDiv);
    }
  }

  //   Function for when page loads
  function onload() {
    sevenDayDiv.hide();
    window.navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position.coords);
      var userLat = position.coords.latitude;
      var userLon = position.coords.longitude;
      currentGeoWeather(userLat, userLon);
    });
    for (var i = 0; i < storedCities.length; i++) {
      var newDiv = $("<div>");
      newDiv.append(
        $(
          "<button type='button' class='btn btn-light cityButton my-1 py-3 text-start col-sm-9'>" +
            storedCities[i] +
            "</button>"
        )
      );
      $("#savedCities").append(newDiv);
    }
  }

  // API/AJAX Functions

  // City Search
  function currentCityWeather(city,alert) {
    clearAlertInterval(alert);
    var queryCityUrl =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=" +
      apiKey +
      "&units=imperial";
    console.log(queryCityUrl);
    $.ajax({
      url: queryCityUrl,
      method: "GET",
    }).done(function (response) {
      console.log(response);
      populateCityData(response);
      cityButtons(response);
    });
  }

  // Zip Code Search
  function currentZipWeather(zip,alert) {
    clearAlertInterval(alert);
    var queryZipUrl =
      "https://api.openweathermap.org/data/2.5/weather?zip=" +
      zip +
      ",us" +
      "&appid=" +
      apiKey +
      "&units=imperial";
    console.log(queryZipUrl);
    $.ajax({
      url: queryZipUrl,
      method: "GET",
    }).done(function (response) {
      console.log(response);
      populateCityData(response);
      cityButtons(response);
    });
  }
  // Coordinate Search - Nests inside function @ line 206
  function currentGeoWeather(lat, lon) {
    var queryGeoUrl =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      apiKey +
      "&units=imperial";
    $.ajax({
      url: queryGeoUrl,
      method: "GET",
    }).done(function (response) {
      console.log(response);
      populateCityData(response);
      cityButtons(response);
    });
  }

  //   Error Handling for unformatted Coordinates
  function handleGeoCoordinates(search,alert) {
    clearAlertInterval(alert);
    var res = search.split(", ");
    console.log(res);
    if (res[0].includes("N")) {
      res[0] = parseFloat(res[0]);
    } else if (res[0].includes("S")) {
      res[0] = -parseFloat(res[0]);
    }
    if (res[1].includes("E")) {
      res[1] = parseFloat(res[1]);
    } else if (res[1].includes("W")) {
      res[1] = -parseFloat(res[1]);
    }
    var latitude = res[0];
    var longitude = res[1];
    console.log(latitude + ", " + longitude);
    currentGeoWeather(latitude, longitude);
  }

  // Function Call
  onload();

  // Event Listeners

  selectOption.on("change", function () {
    console.log(selectOption.val());
    if (selectOption.val() === "coordinates") {
      searchBar.attr("placeholder", "Coordinates-(Latitude, Longitude)");
      $("#inputNotes").text("(Separated by a comma and space)");
    } else if (selectOption.val() === "zip") {
      searchBar.attr("placeholder", "Zip Code");
      $("#inputNotes").empty();
    } else if (selectOption.val() === "city") {
      searchBar.attr("placeholder", "City");
      $("#inputNotes").empty();
    } else {
      searchBar.attr("placeholder", "Select a Search Method");
      $("#inputNotes").empty();
    }
  });

  submitForm.on("click", function (event) {
    event.preventDefault();
    var searchSelection = selectOption.val();
    var searchValue = searchBar.val();
    if (searchSelection === "How would you like to search?") {
      var alertUser = $(
        '<div class="alert alert-danger" role="alert" id="alertMessage">You must select a search criteria</div>'
      );
      $("#alert").append(alertUser);
      var hideAlert = setInterval(function () {
        $("#alert").empty();
      }, 3000);
    } else if (selectOption.val() === "coordinates") {
      clearInterval(hideAlert);
      handleGeoCoordinates(searchValue,hideAlert);
      searchBar.empty();
    } else if (selectOption.val() === "city") {
      clearInterval(hideAlert);
      currentCityWeather(searchValue,hideAlert);
      searchBar.empty();
    } else {
      clearInterval(hideAlert);
      currentZipWeather(searchValue,hideAlert);
    }
  });

  $("#savedCities").on("click", ".btn", function () {
    currentCityWeather(this.textContent);
  });
});
