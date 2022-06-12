# KvaroviServer
REST Node API made using Express, for usage in [Kvarovi](https://github.com/Marko590/Kvarovi), a React Native application.

## Routes

`GET    /vodovod/kvarovi` - returns scraped information from [this webpage](https://www.bvk.rs/kvarovi-na-mrezi/) about today's sewage malfunctions in Belgrade.  


**Return value of the request:**
```
allData : [
    time:string,
    neighbourhoods:[
      neighbourhoodName:string,
      streetList:[
        street:string
      ]
    ]
  ]
```
___
`GET( parameters:{address:string} )    /vodovod/coordinates` - returns coordinates of the street passed in the `address` parameter of the GET request.

Coordinates are acquired by searching for the address in Google Maps, and parsing the body of the search response.

**Return value of the request:**
```
:{
    latitude:string,
    longitude:string
  }
```
