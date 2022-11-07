// 宣告遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}




// 宣告View物件來管理介面相關函式
// displayCards - 負責選出 #cards 並抽換內容
// getCardElement - 負責生成卡片內容，包括花色和數字
// remind: view is a object so we need to put a coma after getCardElement to seperate the item.

// 註：此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性。
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },

  flipCards(...cards) {
    cards.map(card => {
      //回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score:${score}`
  },

  renderTriedTimes(time) {
    document.querySelector('.tried').textContent = `You've tried ${time} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
     <p>Complete!</p>
     <p>Score:${model.score}</p>
     <p>You've tried:${model.triedTimes}</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },

}

const model = {
  revealedCards: [],  //這是一個暫存的牌組，代表被翻出來的卡片。 翻到推進陣列，集滿兩張牌則檢查是否Matched,檢查完就將暫存牌組清空
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}



const controller = {
  // step1. define game initial state
  currentState: GAME_STATE.FirstCardAwaits,  //一開始還沒翻牌
  // step2. display cards at initial state
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // step 3. start to flip cards
  dispatchedCardAction(card) {
    // set up: make sure only can flip the card contains classList, ".back"
    if (!card.classList.contains('back')) {
      return
    }
    // Analyze flipcard possible game state: use Switch
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        console.log(model.isRevealedCardsMatched())
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          console.log('x:', ...model.revealedCards)
          console.log('y:', view.pairCards(...model.revealedCards))
          view.renderScore(model.score += 10)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗  
          this.currentState = GAME_STATE.CardsMatchFailed
          // 要讓玩家有一秒時間記數字再翻回正面
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break;
    }

    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}



// 設定資料
// 0 - 12：黑桃 1 - 13
// 13 - 25：愛心 1 - 13
// 26 - 38：方塊 1 - 13
// 39 - 51：梅花 1 - 13
// 使用外掛函式庫，額外的小工具~
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()


document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchedCardAction(card)
  })
})