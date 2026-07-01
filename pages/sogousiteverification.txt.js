const SOGOU_SITE_VERIFICATION = 'MTIf7YYFo3'

export const getServerSideProps = ({ res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.write(SOGOU_SITE_VERIFICATION)
  res.end()

  return { props: {} }
}

const SogouSiteVerification = () => null

export default SogouSiteVerification
