
Vue.component('yatzy-table', {

  template: `
  <div id="yatzy-table">
    <value-table>
      <value-column></value-column>
    </value-table>
      <player-table>
        <player-column></player-column>
    </player-table>
  </div>
  `
});

Vue.component('value-table', {

  template:`
    <div class="value-table">
      <slot></slot>
    </div>
  `
});

Vue.component('value-column', {

  template: `
    <div class="value-column">
      <div class="value-div" v-for="obj in store.state.yatzyTable">{{ obj.name }}</div>
    </div>
  `
});

Vue.component('player-table', {

  template:`
    <div class="player-table">
      <slot></slot>
    </div>
  `
});

Vue.component('player-column', {

  template: `
    <div class="pColumn">
      <div class="column-div"
      v-for="player, index in store.state.players"
      v-for="obj, index in store.state.yatzyTable"
      v-bind:index="index"
      v-model:value="obj.value"
      v-on:click="addValue(index)"
      v-bind:class="{locked:store.getters.yatzyTable[index].locked, selected: store.getters.yatzyTable[index].locked}">
      {{ obj.value }}
      </div>
    </div>
  `,
  
  methods: {

    addValue: function(index){
      //alert("button clicked at index: " + index);
      
      if(!store.getters.yatzyTable[index].locked){
        store.commit('add', index);
        store.commit('resetDices');
      }
    
      
      //store.state.yatzyTable[index].value = store.state.diceValue;
    }
  }
});

Vue.component('dice', {

  props: ['value','selected', 'index'],

  template: `

    <div class="dice" v-on:click="setSelected(index)"
    v-bind:class="{selectedDice:selected}">
    {{ value }}
    </div>
  `,

  methods: {

    setSelected(index){
      console.log(index);
      store.commit('setSelected', index);
    },
  }
});








const store = new Vuex.Store({

  state: {

    count: 0,

    yatzyTable: [

      {name: 'Aces',        value: null, locked: false}, 
      {name: 'Twos',        value: null, locked: false},
      {name: 'Threes',      value: null, locked: false}, 
      {name: 'Fours',       value: null, locked: false},
      {name: 'Fives',       value: null, locked: false}, 
      {name: 'Sixes',       value: null, locked: false},
      {name: 'Bonus',       value: null, locked: true}, 
      {name: 'Total',       value: null, locked: true},
      {name: 'Pair',        value: null, locked: false, validation: checkPair}, 
      {name: 'Two Pair',    value: null, locked: false, validation: checkTwoPair},
      {name: '3 of a kind', value: null, locked: false, validation: checkTriplets}, 
      {name: '4 of a kind', value: null, locked: false, validation: checkFours},
      {name: 'Sm Straight', value: null, locked: false, validation: checkSLadder},
      {name: 'Lg Straight', value: null, locked: false, validation: checkBLadder}, 
      {name: 'Full House',  value: null, locked: false, validation: checkFullHouse}, 
      {name: 'Yatzy',       value: null, locked: false, validation: checkYatzy}, 
      {name: 'Chance',      value: null, locked: false, validation: checkChance}, 
      {name: 'Total',      value: null, locked:true}
    ],

    dices: [

      {name: 'dice1', value: 1, selected: false}, 
      {name: 'dice2', value: 2, selected: false},
      {name: 'dice3', value: 3, selected: false}, 
      {name: 'dice4', value: 4, selected: false},
      {name: 'dice5', value: 5, selected: false}
    ],

    players: [

      {name: 'player1'}, 
      {name: 'player2'}, 
      {name: 'player3'}
    ]
  },

  mutations: {
    
    add(state, index){
      column = state.yatzyTable[index]
      if(!column.locked){
        column.locked = true;
      }
    },
    
    setSelected(state, index){
      state.dices[index].selected = !state.dices[index].selected;
    },

    rollDices(state){
      min = Math.ceil(1);
      max = Math.floor(7)
      
      if(state.count++ < 3){
        state.dices.forEach(dice => {

          if(!dice.selected){
            dice.value = Math.floor(Math.random() * (max - min) + min);
          }
        });
      }
    },

    resetDices(state){
      state.count = 0;
      state.dices.forEach(dice => {
        dice.selected = false;
      });
    },

    //--------------checking-and-placing-values-in-1st-section-of-table-------------------------------//

    displayValues(state){
      sorted = store.getters.sortedDiceValues;
      table = state.yatzyTable
      for(let i=0; i<6; i++){
        if(!table[i].locked){
          table[i].value = getSuggestions(i+1, sorted);
        }
      }

      //-------------checking-and-placing-values-in-2nd-section-of-table-------------------------------//
  
      table[7].value = store.getters.section1Score;
      for(let i=8; i<17; i++){
        row = table[i];
        row.value = (!row.locked ? row.validation(sorted): row.value);
      }
      table[17].value = store.getters.section1Score + store.getters.section2Score;
    }
  },

  actions: {

  },

  getters: {

    yatzyTable(state){
      return state.yatzyTable;
    },

    count(state){
      return state.count;
    },

    section1Score(state, getters){
      let score = 0;
      for(let i=0; i<6; i++){
        if(getters.yatzyTable[i].locked === true){
          score += getters.yatzyTable[i].value;
        }
      }
      return score;
    },

    section2Score(state, getters){
      let score = 0;
      for(let i=9; i<18; i++){
        if(getters.yatzyTable[i].locked === true){
        score += getters.yatzyTable[i].value;
        }
      }
      return score;
    },

    bonus(state, getters){
      if(getters.section1Score >= 63){
        return 50;
      }
      return null;
    },

    dices(state){
      return state.dices;
    },

    diceValues(state, getters){
      values = [];
      getters.dices.forEach(dice =>{
        values.push(dice.value);
      });
      return values;
    },

    sortedDiceValues(state, getters){
      return getters.diceValues.sort();
    },
  }
});








const app = new Vue({

  el: '#app',

  data: {
    name: "Yatzy"
  },

  methods: {

    rollDice(){
      store.commit('rollDices');
      store.commit('displayValues')
    }
  },

  showValueSum(state, value){
    
  },

  randomInt(){
  return Math.floor(Math.random(1, 7) * Math.floor(7));
}
});








//-------------------helper-functions------------------------//
//-----------------------------------------------------------//

//-----------validating-1st-section-of-table-----------------//

function getSuggestions(value, sortedDices){

  console.log("show values");
  occurance = 0;
    sortedDices.forEach(Dicevalue => {
      
      if(Dicevalue === value){
        occurance ++;
      }
    });
    return occurance * value;
}

//----------validating-2nd-section-of-table------------------//

function checkPair(values){

  for(let i=0; i<values.length-1;i++){
    if(values[i] === values[i+1]){

      return 2 * values[i];
    }
  }
  return 0;
}

function checkTwoPair(values){
  for(let i=0; i<values.length-1;i++){
    if(values[i] === values[i+1]){
      secondPairValue = checkPair(values.slice(i+2, 5))
      if(secondPairValue != 0){
        return (values[i] * 2) + secondPairValue;
      }
    }
  }
  return 0;
}

function checkTriplets(values){

  for(let i=0; i<values.length-2;i++){
    if(values[i] === values[i+1] && values[i+1] === values[i+2]){

      return 3 * values[i];
    }
  }
  return 0;
}

function checkFours(values){

  for(let i=0; i<2;i++){
    if(values[i] === values[i+1] && values[i+1] === values[i+2] && values[i+2]=== values[i+3]){
      return 4 * values[i];
    }
  }
  return 0;
}

function checkSLadder(values){

  if(JSON.stringify(values.slice(0,5)) === JSON.stringify([1,2,3,4,5])){
    return 15;
  }
  return 0;
}

function checkBLadder(values){

  if(JSON.stringify(values.slice(0,5)) === JSON.stringify([2,3,4,5,6])){
    return 15;
  }
  return 0;
}

function checkFullHouse(values){

  if(values[0] === values[1] && values[1] === values[2]){
    pairValue = checkPair(values.slice(3,5));
    if(pairValue != 0){
      return (values[1] * 3) + pairValue;
    }
  }
  else if(values[0] === values[1]){
    tripletValue = checkTriplets(values.slice(2,5));
    if(tripletValue != 0){
      return (values[1] * 2) + tripletValue;
    }
  }
  return 0;
}

function checkYatzy(values){
  if (values.filter(value => value === values[1]).length === 5){
    return 50;
  }
  return 0;
}

function checkChance(values){
  sum =0;
  values.forEach(value => sum += value);
  return sum;
}

//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//