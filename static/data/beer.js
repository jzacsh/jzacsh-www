/**
 * @fileoverview I'd rather hand-write JSON than markup or markdown.
 */

jzacsh = window.jzacsh || {};
jzacsh.data = jzacsh.data || { beer: {} };

jzacsh.data.beer.beer = [
  {
    co: 'River Horse',
    url: 'http://www.riverhorse.com/',
    origin: 'Lambertville, New Jersey',
    notes: [
      '2011-?-?: special ale',
      '?-?-?: american amber'
    ],
  },
  {
    co: 'Long Trail',
    url: 'http://www.longtrail.com/',
    origin: 'Vermont',
    notes: [
      '2010-?-?: double bag ale',
      '2010-10-31: harvest brown ale; absolutely awesome'
    ],
  },
];

jzacsh.data.beer.movies = [
  { title: 'Blazing Saddles' },
  { title: 'Silver Streak'} ,
  { title: 'The Hustler',  note: '(1961)' },
  { title: 'Stalag 17' },
  { title: 'Casablanca' },
  { title: 'Taxi Driver' },
  { title: 'The Dirty Dozen' },
  { title: 'History of the World' },
  { title: 'The Outlaw Josey Wales' },
  { title: 'Animal House' },
  { title: 'Breakfast at Tiffanies' },
  { title: 'Shaun of the Dead' },
  { title: 'Reservoir Dogs' },
  { title: 'Boondock Saints' },
  { title: 'Moon' },
  { title: 'Seven Samurai' },
  { title: 'Casa Blanca' },
  { title: 'Mall Rats' },
  { title: 'Imitation of Life', note: '(1930s version, specifically)' },
  { title: 'Burn After Reading' },
  { title: 'There Will Be Blood' },
  { title: 'Rat Race' },
  { title: 'Citizen cane' },
  { title: 'China town' },
  { title: 'Running Man' },
];

jzacsh.data.beer.books = [
  {
    title: 'The God Delusion',
    author: 'Richard Dawkins',
    note: 'audio',
    read: true,
  },
  {
    title: 'How Proust Can Change Your Life',
    author: 'Alain de Botton',
    note: 'audio',
    read: true,
  },
  {
    title: 'The Shallows: What the Internet Is Doing to Our Brains',
    author: 'Nicholas Carr',
    read: true
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: 'Douglas Adams',
    read: true
  },
  {
    title: 'The Garden of Eden',
    author: 'Ernest Hemingway',
    read: true,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    read: true,
  },
  {
    title: 'Still the Mind',
    author: 'Alan W. Watts',
    read: true,
  },
  {
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    read: true,
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    read: true,
  },
  {
    title: 'Pride & Prejudice',
    author: 'Jane Austen',
    read: true,
  },
  {
    title: 'The Book of Five Rings',
    author: 'Miyamoto Musashi',
    read: true,
  },
  {
    title: 'The Art of War',
    author: 'Sunzi',
    read: true,
  },
  {
    title: 'Catching Fire',
    author: 'Suzanne Collins',
    read: true,
  },
  {
    title: 'Mockingjay',
    author: 'Suzanne Collins',
    read: true,
  },
  {
    title: 'Mockingjay',
    author: 'Suzanne Collins',
    read: true,
  },
  {
    title: 'Destructive Emotions: A Scientific Dialogue with the Dalai Lama',
    author: 'Daniel Goleman',
    note: 'audio',
    read: true,
  },
  {
    title: 'Gender Trouble: Feminism and the Subversion of Identity',
    author: 'Judith Butler',
  },
  {
    title: 'Infinite Jest',
    author: 'David Foster Wallace',
  },
  {
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
  },
  {
    title: 'Fairy Tales Every Child Should Know',
    author: 'Hamilton Wright Mabie',
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    note: 'currently reading',
  },
  {
    title: 'Mountaineering: The Freedom of the Hills',
    author: 'The Mountaineers',
  },
  {
    title: 'Wherever You Go, There You Are',
    author: 'Jon Kabat-Zinn',
  },
  {
    title: 'The Satanic Verses',
    author: 'Salman Rushdie',
  },
  {
    title: 'Slaughterhouse-Five',
    author: 'Kurt Vonnegut',
  },
  {
    title: 'Care of the Soul',
    author: 'Thomas Moore',
  },
  {
    title: 'Relativity',
    author: 'Albert Einstein',
  },
  {
    title: 'Walden',
    author: 'Henry David Thoreau',
  },
  {
    title: 'The Color Purple',
    author: 'Alice Walker',
  },
  {
    title: 'Common Sense',
    author: 'Thomas Paine',
  },
  {
    title: 'The Age of Reason',
    author: 'Thomas Paine',
  },
  { title: 'Origin of Species', author: 'Charles Darwin' },
  { title: 'The Design of Everyday Things', author: 'Donald A. Norman' },
  {
    title: 'Knots & Ropes For Climbers (Outdoor and Nature)',
    author: 'Duane Raleigh',
  },
  {
    title: 'Garbage Land: On the Secret Trail of Trash',
    author: 'Elizabeth Royte',
  },
  {
    title: 'The Pragmatic Programmer: From Journeyman to Master',
    author: 'Andrew Hunt',
  },
  {
    title: 'Modern Art: 19th and 20th Centuries: Selected Papers',
    author: 'Meyer Schapiro',
  },
  {
    title: 'Hacking: The Art of Exploitation, 2nd Edition',
    author: 'Jon Erickson',
  },
  {
    title: 'Nmap Network Scanning: The Official Nmap Project Guide to Network Discovery and Security Scanning',
    author: 'Gordon Fyodor Lyon',
  },
  {
    title: 'The Modern Mind: An Intellectual History of the 20th Century',
    author: 'Peter Watson',
  },
  {
    title: 'The Design of Future Things',
    author: 'Donald A. Norman',
  },
];
