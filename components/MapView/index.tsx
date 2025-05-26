import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styles from "./styles";
import { MapComponentProps } from "./types";

const MapComponent: React.FC<MapComponentProps> = ({
  region,
  selectedPlace,
  onPress,
}) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.container}
      showsUserLocation={true}
      initialRegion={region}
      onPress={onPress}
    >
      {selectedPlace && (
        <Marker
          coordinate={selectedPlace.location}
          title={selectedPlace.name}
          description={selectedPlace.address}
        />
      )}
    </MapView>
  );
};

export default MapComponent;
