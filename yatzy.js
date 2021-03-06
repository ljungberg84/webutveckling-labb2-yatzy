
Vue.component('yatzy-table', {

  template: `
    <div id="yatzy-table">
      <div id="value-table">
        <div class="value-div" v-for="obj in store.getters.yatzyTable">
        {{ obj.name }}
        </div>
      </div>
      <div id="player-table">
        <div class="player-div"
          v-for="player, index in store.state.players"
          v-for="obj, index in store.state.yatzyTable"
          v-bind:index="index"
          v-model:value="obj.value"
          v-on:click="addValue(index)"
          v-bind:class="{locked:store.getters.yatzyTable[index].locked, selected: store.getters.yatzyTable[index].locked}">
          {{ obj.value }}
        </div>
      </div>
    </div>
  `,

  methods: {

    addValue: function(index){
      
      if(!store.getters.yatzyTable[index].locked){
        store.commit('add', index);
        store.commit('resetDices');
      }
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
      store.commit('setSelected', index);
    },
  }
});



const store = new Vuex.Store({

  state: {

    count: 0,//keep track of number of rolls
    
    yatzyTable: [//models the yatzy table

      {name: 'Aces',        value: 0, locked: false}, 
      {name: 'Twos',        value: 0, locked: false},
      {name: 'Threes',      value: 0, locked: false}, 
      {name: 'Fours',       value: 0, locked: false},
      {name: 'Fives',       value: 0, locked: false}, 
      {name: 'Sixes',       value: 0, locked: false},
      {name: 'Bonus',       value: 0, locked: true}, 
      {name: 'Total',       value: 0, locked: true},
      {name: 'Pair',        value: 0, locked: false, validation: checkPair}, 
      {name: 'Two Pair',    value: 0, locked: false, validation: checkTwoPair},
      {name: '3 of a kind', value: 0, locked: false, validation: checkTriplets}, 
      {name: '4 of a kind', value: 0, locked: false, validation: checkFours},
      {name: 'Sm Straight', value: 0, locked: false, validation: checkSLadder},
      {name: 'Lg Straight', value: 0, locked: false, validation: checkBLadder}, 
      {name: 'Full House',  value: 0, locked: false, validation: checkFullHouse}, 
      {name: 'Yatzy',       value: 0, locked: false, validation: checkYatzy}, 
      {name: 'Chance',      value: 0, locked: false, validation: checkChance}, 
      {name: 'Total',       value: 0, locked: true}
    ],

    dices: [

      {name: 'dice1', value: 'Y', selected: false}, 
      {name: 'dice2', value: 'A', selected: false},
      {name: 'dice3', value: 'T', selected: false}, 
      {name: 'dice4', value: 'Z', selected: false},
      {name: 'dice5', value: 'Y', selected: false}
    ],

    yatzy: ["Y", "A", "T", "Z", "Y"]
  },

  mutations: {
    
    add(state, index){//add value to yatzy table
      table = state.yatzyTable;
      column = table[index]
      if(!column.locked){
        if(state.count !== 0){
          column.locked = true;
        }
      }
      table[7].value = store.getters.section1Score;
      table[17].value = store.getters.totalScore;
      checkResults();//check if game over
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

    resetDices(state){// resets after every round
      state.count = 0;
      for(let i=0; i<5; i++){
        state.dices[i].selected = false;
        state.dices[i].value = state.yatzy[i];
      }
      state.yatzyTable.forEach(row => {
        if (!row.locked){
          row.value = 0;
        }
      });
    },

    resetGame(state){// resets after completed game
      state.count = 0;
      table = state.yatzyTable
      table.forEach(row => {
        row.value = 0;
        row.locked = false;
      });
      table[6].locked = true;
      table[7].locked = true;
      table[17].locked = true;
    },

    //--------------validating-and-placing-values-in-1st-section-of-table-------------------------------//

    displayValues(state){
      sorted = store.getters.sortedDiceValues;
      table = state.yatzyTable
      for(let i=0; i<6; i++){
        if(!table[i].locked){
          table[i].value = getSuggestions(i+1, sorted);
        }
      }

      //-------------validating-and-placing-values-in-2nd-section-of-table-------------------------------//
      table[6].value = store.getters.bonus;
      table[7].value = store.getters.section1Score;
      for(let i=8; i<17; i++){
        row = table[i];
        row.value = (!row.locked ? row.validation(sorted): row.value);
      }
      table[17].value = store.getters.totalScore;
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

    totalScore(state, getters){
      let score = 0;
      for(let i=8; i<17; i++){
        if(getters.yatzyTable[i].locked === true){
        score += getters.yatzyTable[i].value;
        }
      }
      return score + getters.section1Score;
    },

    bonus(state, getters){
      if(getters.section1Score >= 63){
        return 50;
      }
      return 0;
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
function getSuggestions(value, sortedDices){//validates values for the first six rows in yatzy table

  occurance = 0;
    sortedDices.forEach(Dicevalue => {
      
      if(Dicevalue === value){
        occurance ++;
      }
    });
      return occurance * value;    
}

//----------functions-validating-2nd-section-of-table------------------//
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
  sum = 0;
  values.forEach(value => sum += value);
  return sum;
}

function checkResults(){
  table = store.getters.yatzyTable;
  for(let i=0; i<table.length; i++){
    if(!table[i].locked){
      return;
    }
  }
  alert("congratulations, you got " + store.getters.totalScore + " points!!")
  store.commit('resetDices');
  store.commit('resetGame');
}