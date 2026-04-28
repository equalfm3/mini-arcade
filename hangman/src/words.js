/* Hangman — Word Lists by Category */

var Words = (function () {

  var lists = {
    Animals: [
      'tiger', 'eagle', 'shark', 'whale', 'horse', 'zebra', 'panda', 'koala',
      'snake', 'mouse', 'camel', 'bison', 'otter', 'raven', 'crane', 'gecko',
      'llama', 'moose', 'squid', 'trout', 'robin', 'finch', 'viper', 'hyena',
      'lemur', 'sloth', 'stork', 'heron', 'macaw', 'coral', 'falcon', 'parrot',
      'jaguar', 'walrus', 'badger', 'ferret', 'iguana', 'toucan', 'salmon',
      'turtle', 'donkey', 'monkey', 'rabbit', 'pigeon', 'lizard', 'beetle',
      'mantis', 'condor', 'pelican', 'dolphin'
    ],
    Food: [
      'pizza', 'pasta', 'sushi', 'bread', 'steak', 'salad', 'mango', 'grape',
      'peach', 'lemon', 'melon', 'olive', 'onion', 'basil', 'thyme', 'cream',
      'toast', 'bacon', 'curry', 'broth', 'crepe', 'donut', 'fudge', 'honey',
      'maple', 'sauce', 'sugar', 'wheat', 'berry', 'guava', 'papaya', 'waffle',
      'cookie', 'muffin', 'butter', 'cheese', 'ginger', 'garlic', 'pepper',
      'tomato', 'carrot', 'celery', 'turnip', 'radish', 'almond', 'cashew',
      'walnut', 'pretzel', 'burrito', 'noodles'
    ],
    Countries: [
      'japan', 'china', 'india', 'spain', 'italy', 'egypt', 'chile', 'nepal',
      'kenya', 'ghana', 'qatar', 'tonga', 'nauru', 'benin', 'gabon', 'niger',
      'samoa', 'syria', 'yemen', 'sudan', 'libya', 'malta', 'fiji', 'cuba',
      'france', 'brazil', 'canada', 'mexico', 'greece', 'turkey', 'poland',
      'sweden', 'norway', 'panama', 'jordan', 'israel', 'russia', 'angola',
      'zambia', 'uganda', 'serbia', 'latvia', 'monaco', 'bhutan', 'brunei',
      'belize', 'guyana', 'malawi', 'tuvalu', 'cyprus'
    ],
    Sports: [
      'rugby', 'tennis', 'soccer', 'boxing', 'diving', 'skiing', 'rowing',
      'judo', 'polo', 'golf', 'surf', 'yoga', 'darts', 'fencing', 'hockey',
      'karate', 'squash', 'sprint', 'discus', 'hammer', 'javelin', 'hurdle',
      'relay', 'vault', 'rings', 'slalom', 'biking', 'racing', 'archer',
      'bowler', 'paddle', 'tackle', 'volley', 'stroke', 'crawl', 'baton',
      'match', 'round', 'pitch', 'court', 'track', 'field', 'medal',
      'trophy', 'league', 'finals', 'season', 'record', 'score', 'coach'
    ],
    Technology: [
      'pixel', 'robot', 'laser', 'radar', 'modem', 'cloud', 'cache', 'debug',
      'array', 'stack', 'queue', 'graph', 'token', 'proxy', 'codec', 'patch',
      'virus', 'macro', 'query', 'index', 'parse', 'route', 'scope', 'class',
      'logic', 'input', 'mouse', 'fiber', 'drone', 'lidar', 'server', 'socket',
      'binary', 'cursor', 'kernel', 'thread', 'buffer', 'cipher', 'widget',
      'module', 'script', 'syntax', 'vector', 'matrix', 'neural', 'render',
      'shader', 'bitmap', 'driver', 'sensor'
    ]
  };

  var currentCategory = null;
  var currentWord = null;

  function pickWord(category) {
    currentCategory = category || randPick(Config.categories);
    var pool = lists[currentCategory];
    if (!pool || pool.length === 0) {
      currentCategory = 'Animals';
      pool = lists['Animals'];
    }
    currentWord = randPick(pool).toUpperCase();
    return currentWord;
  }

  return {
    pickWord: pickWord,
    get word() { return currentWord; },
    get category() { return currentCategory; },
    get categories() { return Config.categories; },
  };
})();
