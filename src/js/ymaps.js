let geoObjects = [];

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
    storage.forEach((item, i) => {
      let geoObject = new ymaps.Placemark(item.coords, {
        balloonContent:
          `<ul class='reviews'>
          <li class='reviews__item'>
            <div class='reviews__item-info'>
              <span class='reviews__item-name'>${item.firstName}</span> 
              <span class='reviews__item-place'>${item.place}</span>
              <span class='reviews__item-date'>${item.date}</span>
            </div>
            <div class='reviews__item-text'>${item.review}</div>
            </li>
        </ul>` + balloonTemplate,
      });
      geoObjects.push(geoObject);
    });
    myMap.geoObjects.add(clusterer);
    clusterer.add(geoObjects);
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

    let clusterer = new ymaps.Clusterer({
      clusterDisableClickZoom: true,
    });
    //load data from localStorage
    if (localStorage.data) {
      updatePlacemarks(spb, clusterer);
    } else {
      localStorage.data = "[]";
    }

    //Open balloon by click
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

              updatePlacemarks(spb);
            });
          });
      } else {
        spb.balloon.close();
      }
    });
  });
}

export { mapInit };
