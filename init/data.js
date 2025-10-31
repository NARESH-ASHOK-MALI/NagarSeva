const PUNE = [73.8567, 18.5204]; // [lng, lat]

const sampleListings = [
  {
    title: "Deep pothole on Main Street",
    description: "A large pothole near the crosswalk, causing traffic slowdowns.",
    image: "https://www.shutterstock.com/image-photo/deep-water-filled-pothole-shopping-600nw-2445881413.jpg",
    date: new Date("2025-09-20T10:30:00Z"),
    address: "Main Street by Central Park",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Broken streetlight near school",
    description: "Streetlight has not been working for over a week; creates dark area at night.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrd2k2kMHnuJ2O7MYPms8e_hlYmimTCAe5lg&s",
    date: new Date("2025-09-18T19:15:00Z"),
    address: "Elm Road near Government School",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Overflowing trash bin on market road",
    description: "Garbage bin not emptied for days, trash spread around the area.",
    image: "https://thumbs.dreamstime.com/b/garbage-bins-overflowing-cause-pollution-51575293.jpg",
    date: new Date("2025-09-19T08:45:00Z"),
    address: "Market Road junction",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Cracked sidewalk near bus stop",
    description: "Sidewalk has large cracks, dangerous for elderly and children.",
    image: "https://static.toiimg.com/photo/imgsize-187366,msid-112752740/112752740.jpg",
    date: new Date("2025-09-17T14:20:00Z"),
    address: "Bus Stop outside City Mall",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Blocked drain causing waterlogging",
    description: "After rains, water accumulates heavily due to blocked drain.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfR0xd3mcedPPQ7pJgxOBVfcao9h77L8_oEg&s",
    date: new Date("2025-09-16T09:00:00Z"),
    address: "Drain by Riverside Road",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Fallen tree branch blocking road",
    description: "Tree branch fell and blocking one lane, needs removal.",
    image: "https://media.sciencephoto.com/c0/42/67/06/c0426706-800px-wm.jpg",
    date: new Date("2025-09-15T07:50:00Z"),
    address: "Oak Avenue near Library",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Graffiti on public wall",
    description: "Unauthorized graffiti defacing public wall, requests clean-up.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8xn-Gf1ZbgrL4IJLjzskGQxRZ9yPXglu5QA&s",
    date: new Date("2025-09-14T11:30:00Z"),
    address: "Wall beside Community Center",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Bus shelter glass broken",
    description: "The glass panel in bus shelter shattered, danger to pedestrians.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI7155LqK9WjG5p5TNBEFetvIMrG1CU-XV9A&s",
    date: new Date("2025-09-13T20:10:00Z"),
    address: "Bus Shelter near Hospital",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Unlit alley at night",
    description: "Alley streetlight doesn’t turn on, unsafe for night walkers.",
    image: "https://images.pexels.com/photos/12579256/pexels-photo-12579256.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    date: new Date("2025-09-12T22:45:00Z"),
    address: "Back Alley behind Main Mall",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Misaligned manhole cover",
    description: "Manhole cover is raised, causing tripping hazard.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRonFpKbJ9xAAU4uelAhYpuCQhHEfakxKMZPw&s",
    date: new Date("2025-09-11T13:15:00Z"),
    address: "Pine Street near Health Clinic",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Leaking water pipe flooding pavement",
    description: "Water continuously leaking, flooding the walkway.",
    image: "https://www.meltontimes.co.uk/webimg/legacy_oak_98588857.jpg?crop=3:2,smart&trim=&width=640&quality=65&enable=upscale",
    date: new Date("2025-09-10T16:40:00Z"),
    address: "Waterworks Road near Market Center",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Bus stop bench damaged",
    description: "Wooden bench in bus stop broken, unsafe to sit.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBibH9DcCghDRe_a2FGSsyIlUk6XS4Ao1ocg&s",
    date: new Date("2025-09-09T08:00:00Z"),
    address: "Bus Stop on Hill Road",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Street banner hanging dangerously",
    description: "Banner across road dangling low, strong wind could make it fall.",
    image: "https://images.firstpost.com/uploads/2024/05/hoarding1-2024-05-d0484f57314b9ab1eb9986478ad7d598.jpg?im=FitAndFill=(1200,675)",
    date: new Date("2025-09-08T12:00:00Z"),
    address: "High Street across Shop Row",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Overflowing sewer smell",
    description: "Manhole sewage overflowing, smell unbearable.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8IR-4Xr-MU2h46liwiu6dRDRR-1TQIf-htw&s",
    date: new Date("2025-09-07T18:30:00Z"),
    address: "Sewer near Old Market Lane",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Cracked road surface after rain",
    description: "Rain has worsened cracks; vehicles bumping.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm2ysl8mDUMcxPuMgUeB9SKWKMxRcecTQTZg&s",
    date: new Date("2025-09-06T14:15:00Z"),
    address: "Rainy Road crossing",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Sidewalk blocked by parked trucks",
    description: "Trucks parked illegally, forcing pedestrians onto road.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2mONGXui-AI1pLwTNivtjPLdexZbQjMkdTA&s",
    date: new Date("2025-09-05T09:30:00Z"),
    address: "Commerce Street near Warehouse",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Lost street sign missing",
    description: "Street name sign missing from intersection; confusing for drivers.",
    image: "https://i0.wp.com/goodmorningwilton.com/wp-content/uploads/2017/09/missing-street-signs.jpg?fit=1200%2C900&ssl=1",
    date: new Date("2025-09-04T20:00:00Z"),
    address: "5th Avenue & Maple Crossroad",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Unauthorized dumping in vacant lot",
    description: "People dumping waste in lot behind residential area.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK8GuySVpRTuWrMz1zdEQPrfPNpfWtRy6nVg&s",
    date: new Date("2025-09-03T17:45:00Z"),
    address: "Vacant Lot behind Riverside Drive",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Street curb crumbled",
    description: "Curb stone is broken, potential hazard when turning corner.",
    image: "https://thumbs.dreamstime.com/b/deteriorating-street-surface-curb-sidewalk-crumbling-infrastructure-transportation-copy-space-horizontal-aspect-deteriorating-313152884.jpg",
    date: new Date("2025-09-02T11:10:00Z"),
    address: "Curb outside Central Library",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Traffic signal blinking erratically",
    description: "Traffic signal flickers, sometimes turns off completely.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS78e-nKVXvBLhHpaqO9JdXiE3c9_lvLmHRQ&s",
    date: new Date("2025-09-01T22:20:00Z"),
    address: "Signal at Rosewood & 3rd Street",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Broken park fence",
    description: "Fence around playground broken, kids can wander out.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtIVoR3KjEZrUWQe3RALazn-pOV8oyFaPnVg&s",
    date: new Date("2025-08-31T15:00:00Z"),
    address: "Playground Park South Side",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Faded pedestrian crossing lines",
    description: "Crosswalk lines faded, cars not noticing pedestrian crossing.",
    image: "https://www.shutterstock.com/image-photo/worn-pedestrian-crosswalk-on-asphalt-260nw-2599012591.jpg",
    date: new Date("2025-08-30T13:45:00Z"),
    address: "Crosswalk near Train Station",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Loose electrical wire overhead",
    description: "Wire hanging from pole, strong wind might make it fall.",
    image: "https://images.tribuneindia.com/cms/gall_content/2017/7/2017_7$largeimg02_Sunday_2017_011055792.jpg",
    date: new Date("2025-08-29T07:15:00Z"),
    address: "Pole outside City Hospital",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Broken water hydrant leaking",
    description: "Fire hydrant leaking water continuously since last night.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh8zm0Te9O_8hCogbt7zg-6btJdqVI7yCBQw&s",
    date: new Date("2025-08-28T18:30:00Z"),
    address: "Hydrant at Riverbend Street",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Damaged drain cover missing grid",
    description: "Grating missing from drain cover, big hole remains.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzsQNFmjoNCcxPxfxSJMT7wyjFNWja2ZYdfw&s",
    date: new Date("2025-08-27T14:50:00Z"),
    address: "Drain between 9th & Oak Lane",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Public bench slanted & broken",
    description: "One bench in park has broken leg and is tilting.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWccVdOYJa9MlLc8_4G3nIJLTMm7SwVPC7RQ&s",
    date: new Date("2025-08-26T10:20:00Z"),
    address: "Lake View Park Bench Area",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Street vendor cart blocking sidewalk",
    description: "Cart parked permanently, pedestrians forced on road.",
    image: "https://ca-times.brightspotcdn.com/dims4/default/c313103/2147483647/strip/true/crop/3600x2400+0+0/resize/1200x800!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fc3%2Fe0%2Fc2f7861c463d9c39b808b1871ccf%2F1269883-me-0316-street-vending-rally-011-ik.jpg",
    date: new Date("2025-08-25T17:40:00Z"),
    address: "Vendor Alley next to Food Court",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Illegal poster tearing off wall",
    description: "Posters have been stuck & half torn, ugly look.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyq1ts0wEz5GjbPGB20Pmn2aeum_R5fo7hnQ&s",
    date: new Date("2025-08-24T12:00:00Z"),
    address: "Wall near Bus Terminal",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Road edge eroded near gutter",
    description: "Edge of the road eroding, dangerous for two-wheelers.",
    image: "https://trapbag.com/wp-content/uploads/2024/07/road-erosion.jpg",
    date: new Date("2025-08-23T09:15:00Z"),
    address: "Gutter Road Crossing",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  },
  {
    title: "Traffic mirror broken at sharp turn",
    description: "Mirror that helps in corner is broken & cracked glass.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZF1Qxg_aijG6CH-GAU9tw4d6YhquZn7Y1sg&s",
    date: new Date("2025-08-22T19:30:00Z"),
    address: "Sharp Turn on Willow Bend",
    city: "Pune",
    location: { type: 'Point', coordinates: PUNE }
  }
];

module.exports = sampleListings;
