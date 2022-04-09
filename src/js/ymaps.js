import reviewTemplate from "../templates/reviews.hbs";

function mapInit() {
  let balloonTemplate = `<form class='balloon-form'>
    <h3 class='balloon-form__header'>Отзыв:</h3>
    <input class='balloon-form__input' placeholder='Укажите ваше имя' name="firstName" required>
    <input class='balloon-form__input' placeholder='Укажите место' name="place" required>
    <textarea class='balloon-form__input balloon-form__input--textarea' placeholder='Оставьте отзыв' name="review" required></textarea>
    <button class="balloon-form__button">Добавить</button>
  </form>`;

  function updatePlacemarks(myMap, clusterer) {
    let storage = JSON.parse(localStorage.data);
    let geoObjects = [];

    storage.forEach((item, i) => {
      //html from reviews.hbs template
      let reviewHTML = reviewTemplate(item);
      let geoObject = new ymaps.Placemark(item.coords, {
        balloonContent: reviewHTML + balloonTemplate,
      });
      geoObjects.push(geoObject);
    });
    clusterer.removeAll();
    clusterer.add(geoObjects);
    myMap.geoObjects.add(clusterer);
  }

  function addPlacemarkToLocalStorage(coords, form) {
    let date = new Date();
    let storage = JSON.parse(localStorage.data);

    storage.push({
      coords: coords,
      firstName: form.firstName.value,
      place: form.place.value,
      review: form.review.value,
      date: date.toLocaleDateString(),
    });

    localStorage.data = JSON.stringify(storage);
  }

  ymaps.ready(() => {
    //map controls config
    let spb = new ymaps.Map(
      "map",
      {
        center: [59.95, 30.46],
        zoom: 10,
        controls: [],
      },
      {
        balloonMaxWidth: 310,
      }
    );

    spb.controls.add("searchControl", {
      float: "left",
      floatIndex: 200,
    });
    spb.controls.add("routeButtonControl", {
      size: "small",
      float: "left",
      floatIndex: 100,
    });
    spb.controls.add("zoomControl", {
      size: "small",
      position: { right: 10, top: 300 },
    });
    spb.controls.add("geolocationControl", {
      position: { right: 10, top: 370 },
    });
    spb.controls.add("trafficControl", {
      size: "small",
      float: "right",
      floatIndex: 100,
    });
    spb.controls.add("rulerControl", {
      scaleLine: false,
      float: "right",
      floatIndex: 200,
    });
    spb.controls.add("typeSelector", {
      size: "small",
      float: "right",
      floatIndex: 300,
    });

    //Open balloon by click on map
    spb.events.add("click", function (e) {
      if (!spb.balloon.isOpen()) {
        let coords = e.get("coords");
        spb.balloon
          .open(coords, {
            contentBody: balloonTemplate,
          })
          .then(() => {
            const balloonForm = document.querySelector(".balloon-form");
            const balloonButton = balloonForm.querySelector(".balloon-form__button");
            balloonButton.addEventListener("click", (e) => {
              e.preventDefault();

              if (!balloonForm.firstName.value || !balloonForm.place.value || !balloonForm.review.value) return;

              addPlacemarkToLocalStorage(coords, balloonForm);

              spb.balloon.close();

              updatePlacemarks(spb, clusterer);
            });
          });
      } else {
        spb.balloon.close();
      }
    });

    let clusterer = new ymaps.Clusterer({
      // groupByCoordinates: true,
      clusterOpenBalloonOnClick: true,
      clusterBalloonMaxWidth: 310,
      clusterDisableClickZoom: true,
    });

    //load data from localStorage
    if (localStorage.data) {
      updatePlacemarks(spb, clusterer);
    } else {
      localStorage.data = "[]";
    }

    //Set balloon text by click on cluster
    clusterer.events.add("click", function (e) {
      let clusterPlacemark = e.get("target");
      let coords = clusterPlacemark.geometry.getCoordinates();
      //if object is cluster set text
      if (clusterPlacemark.getGeoObjects) {
        let geoObjects = clusterPlacemark.getGeoObjects();
        let reviewHTML = "";

        geoObjects.forEach((item) => {
          let htmlString = item.properties.get("balloonContent");
          let htmlText = new DOMParser().parseFromString(htmlString, "text/html");

          reviewHTML += htmlText.querySelector(".reviews__item").outerHTML;
        });

        let customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
          `<ul class='reviews'>
          ${reviewHTML}
          </ul>` + balloonTemplate
        );
        clusterPlacemark.options.set("balloonContentLayout", customBalloonContentLayout);
      }

      spb.balloon.open().then(() => {
        const balloonForm = document.querySelector(".balloon-form");
        const balloonButton = balloonForm.querySelector(".balloon-form__button");
        console.log("Всё сработает", balloonButton);
        balloonButton.addEventListener("click", (e) => {
          e.preventDefault();

          if (!balloonForm.firstName.value || !balloonForm.place.value || !balloonForm.review.value) return;
          addPlacemarkToLocalStorage(coords, balloonForm);

          spb.balloon.close();

          updatePlacemarks(spb, clusterer);
        });
      });
    });
  });
}

export { mapInit };
