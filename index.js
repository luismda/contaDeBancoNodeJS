const inquirer = require('inquirer')
const chalk = require('chalk')

const fs = require('fs')

console.clear()
operation()

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair']
    }])
    .then(answer => {
        const action = answer.action

        if (action === 'Criar Conta') {
            console.clear()
            createAccount()
        } else if (action === 'Consultar Saldo') {
            console.clear()
            getAccountBalance()
        } else if (action === 'Depositar') {
            console.clear()
            deposit()
        } else if (action === 'Sacar') {
            console.clear()
            withdraw()
        } else if (action === 'Sair') {
            console.clear()
            terminateExecution()
        }
    })
    .catch(err => console.log(err))
}

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:'
        }
    ])
    .then(answer => {
        const accountName = answer['accountName']

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.clear()
            console.log(chalk.bgRed.black('Essa conta já exsite, escolha outro nome!'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', err => console.log(err))

        console.clear()
        console.log(chalk.green('Parabéns, sua conta foi criada!'))
        operation()
    })
    .catch(err => console.log(err))
}

function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(answer => {
        const accountName = answer.accountName

        if (!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Qual valor deseja depositar?'
        }])
        .then(answer => {
            const amount = answer.amount

            addAmount(accountName, amount)

            operation()
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.clear()
        console.log(chalk.bgRed.black('Essa conta não existe, tente novamente.'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!accountData) {
        console.clear()
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente.'))
        return deposit()
    }

    if (!amount) {
        console.clear()
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente.'))
        return
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err))

    console.clear()
    console.log(chalk.green(`Foi depositado o valor de R$ ${amount} na sua conta!`))
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {encoding: 'utf8', flag: 'r'})
    return JSON.parse(accountJSON)
}

function getAccountBalance() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(answer => {
        const accountName = answer.accountName

        if (!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.clear()
        console.log(chalk.bgBlue.black(`O saldo da sua conta é R$ ${accountData.balance}`))
        operation()
    })
    .catch(err => console.log(err))
}

function withdraw() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(answer => {
        const accountName = answer.accountName

        if (!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Qual valor você deseja sacar?'
        }])
        .then(answer => {
            const amount = answer.amount

            removeAmount(accountName, amount)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.clear()
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente.'))
        return withdraw()
    }

    if (accountData.balance < amount) {
        console.clear()
        console.log(chalk.bgRed.black('Valor indisponível'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err))

    console.clear()
    console.log(chalk.green(`Foi realizado um saque de R$ ${amount} na sua conta.`))
    operation()
}

function terminateExecution() {
    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
    process.exit()
}