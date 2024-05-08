export const copyToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard) {
    return await navigator.clipboard.writeText(text)
  }
}

export const pasteFromClipboard = async (): Promise<string> => {
  if (navigator.clipboard) {
    return await navigator.clipboard.readText()
  }
  return ''
}
