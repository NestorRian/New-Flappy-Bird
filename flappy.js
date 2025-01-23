function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)

}

// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando elemento sair da area do jogo 
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'assets/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false


    // Para mobile (toque)
    window.addEventListener('touchstart', () => voando = true);
    window.addEventListener('touchend', () => voando = false);

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)

}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if (!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = estaoSobrePostos(passaro.elemento, superior)
                || estaoSobrePostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}


function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 210, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.innerHTML = '' // Limpa a area do jogo antes de adicionar elementos

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    const botaoReiniciar = document.createElement('button')
    botaoReiniciar.innerHTML = 'Reiniciar'
    botaoReiniciar.style.position = 'absolute'
    botaoReiniciar.style.top = '50%'
    botaoReiniciar.style.background = '#639301'
    botaoReiniciar.style.color = 'white'
    botaoReiniciar.style.left = '50%'
    botaoReiniciar.style.borderRadius = '30px'  // Deixa o botão arredondado
    botaoReiniciar.style.transform = 'translate(-50%, -50%)'
    botaoReiniciar.style.padding = '15px 30px'
    botaoReiniciar.style.fontSize = '20px'
    botaoReiniciar.style.cursor = 'pointer'
    botaoReiniciar.style.display = 'none'
    areaDoJogo.appendChild(botaoReiniciar)

    const mensagemGameOver = document.createElement('div')
    mensagemGameOver.innerHTML = 'GAME OVER!'
    mensagemGameOver.style.position = 'absolute'
    mensagemGameOver.style.top = '40%'
    mensagemGameOver.style.left = '50%'
    mensagemGameOver.style.transform = 'translate(-50%, -50%)'
    mensagemGameOver.style.fontSize = '50px'
    mensagemGameOver.style.color = 'red'
    mensagemGameOver.style.fontWeight = 'bold'
    mensagemGameOver.style.display = 'none'
    areaDoJogo.appendChild(mensagemGameOver)

    // Adicionando música ao jogo
    const musica = new Audio('assets/msc-jogo.mp3')
    musica.loop = true // Reproduzir em loop
    musica.volume = 0.5 // Define o volume (0.0 a 1.0)

    let temporizador = null

    this.start = () => {

        musica.play()  // Inicia a música quando o jogo começar

        // loop do jogo
        temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                musica.pause()  // Para a música quando o jogo acaba
                mensagemGameOver.style.display = 'block'
                botaoReiniciar.style.display = 'block'
            }
        }, 20)
    }

    botaoReiniciar.onclick = () => {
        new FlappyBird().start() // Reinicia o jogo chamando uma nova instância
    }
}

new FlappyBird().start()