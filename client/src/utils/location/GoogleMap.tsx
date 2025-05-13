import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent, Pin } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

type Poi = { key: string, location: google.maps.LatLngLiteral }

const PoiMarkers = (props: { pois: Poi[] }) => {
    return (
        <>
            {props.pois.map((poi: Poi) => (
                <AdvancedMarker
                    key={poi.key}
                    position={poi.location}>
                    <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
                </AdvancedMarker>
            ))}
        </>
    );
};

export const GoogleMap = ({ mapId, name, latitude, longitude }: {
    name: string;
    mapId: string;
    latitude: number;
    longitude: number;
}) => {

    useEffect(() => {
        console.log('GoogleMap component mounted');
        console.log('Map ID:', mapId);
        console.log('Latitude:', latitude);
        console.log('Latitude:', typeof latitude);
        console.log('Longitude:', longitude);
        console.log('Longitude:', typeof longitude);
        console.log('Name:', name);
        console.log('Map ID:', mapId);
    }, [])

    return <APIProvider apiKey={'AIzaSyBt57R8L_7nNaskobeBU-rxDEYvGcwPquk'}
        onLoad={() => console.log('Maps API has loaded.')}>
        <Map
            defaultZoom={13}
            defaultCenter={{ lat: Number(latitude), lng: Number(longitude) }}
            mapId={mapId}
            onCameraChanged={(ev: MapCameraChangedEvent) =>
                console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }>
            <PoiMarkers pois={[
                { key: name, location: { lat: Number(latitude), lng: Number(longitude) } },
            ]} />
        </Map>
        {/* Redicect to Google Maps */}


    </APIProvider>
};
