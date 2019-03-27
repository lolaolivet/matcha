<template>
  <div>
    <h3>Select a new Location</h3>
    <!-- <div class="profile-edit__button-container">
      <button  @click="addMarker" class="profile-edit__button">Update my location</button>
    </div> -->
    <gmap-map
      :center="center"
      :zoom="12"
      style="width:100%; height: 400px;" 
    >
      <gmap-marker v-if="markers[0]"
        :key="0"
        :position="markers[0].position"
        @click="center=markers[0].position"
      ></gmap-marker>
    </gmap-map>
    <div class="google-map-input">
      <gmap-autocomplete @place_changed="setPlace">
      </gmap-autocomplete>
    </div>
    <p class='note'>If you indicate a fake position, you won't find people near you</p>
    <p class='note'>Only the distance is displayed to other users</p>
  </div>
</template>

<script>
export default {
  name: 'GoogleMap',
  data () {
    return {
      // location of 42
      center: { lat: 48.896607, lng: 2.316307 },
      markers: [],
      // places: [],
      currentPlace: null
    };
  },
  async mounted () {
    const location = this.$store.getters.location;
    // center map and create marker on last logged location
    if (location && 'latitude' in location && 'longitude' in location) {
      const coord = {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude)
      };
      this.center = coord;
      this.markers.push({ position: coord });
    } else {
      // if coordinates has never been initialized with default
      // values the marker and map are centered on 42 here
      // but the geolocator doesn't work on localhost and the
      // default value is initialized on server side with copacabana coordinates
      this.markers.push({ position: this.center });
    }
  },
  methods: {
    setPlace (place) {
      if (place.geometry) {
        this.currentPlace = place;
        this.addMarker();
      }
    },
    clearMarker () {
      this.markers = [];
    },
    addMarker () {
      if (this.currentPlace) {
        this.clearMarker();
        const marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng()
        };
        this.markers.push({ position: marker });
        // this.places.push(this.currentPlace);
        this.center = marker;
        this.currentPlace = null;
        this.$emit('send', marker);
      }
    },
  }
};
</script>

<style>
.google-map-input {
  width: 100%;
  display: grid;
  border: 2px solid var(--accent-color);
  box-sizing: border-box;
  margin: 1em auto 0;
  padding: .5em;
  border-radius: .2em;
}
.google-map-input > input {
  font-size: 1em;
  outline: 0;
  border: 0;
  background-color: var(--bg);
  color: var(--text-color);
}
.note {
  font-size: small;
  margin: .2em .5em 0;
}
</style>