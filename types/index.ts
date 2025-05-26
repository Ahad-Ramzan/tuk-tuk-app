import { LatLng } from "react-native-maps";

export interface Place {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  timestamp: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
