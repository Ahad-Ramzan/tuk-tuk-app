import { MapPressEvent } from "react-native-maps";
import { Place, Region } from "../../types";

export interface MapComponentProps {
  region: Region;
  selectedPlace: Place | null;
  onPress?: (event: MapPressEvent) => void;
}
