import { useContext } from 'react'
import Button from '../../components/Button'
import Title from '../../components/Title'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import { NavigationContext, Pages } from '../../providers/navigation'
import Content from '../../components/Content'
import Container from '../../components/Container'
import TransactionsList from '../../components/TransactionsList'
import { WalletContext } from '../../providers/wallet'

export default function Transactions() {
  const { navigate } = useContext(NavigationContext)
  const { wallet } = useContext(WalletContext)

  const exportCSVFile = () => {
    const transactions = wallet.transactions[wallet.network]
    if (transactions?.length === 0) return
    const csvHeader =
      Object.keys(transactions[0])
        .map((k) => `"${k}"`)
        .join(',') + '\n'
    const csvBody = transactions
      .map((row) =>
        Object.values(row)
          .map((k) => `"${k}"`)
          .join(','),
      )
      .join('\n')
    const hiddenElement = document.createElement('a')
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvHeader + csvBody)
    hiddenElement.target = '_blank'
    hiddenElement.download = 'transactions.csv'
    document.body.appendChild(hiddenElement) // required for firefox
    hiddenElement.click()
  }

  const goBackToWallet = () => navigate(Pages.Wallet)

  return (
    <Container>
      <Content>
        <Title text='Transactions' />
        <TransactionsList />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={exportCSVFile} label='Export CSV file' />
        <Button onClick={goBackToWallet} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
