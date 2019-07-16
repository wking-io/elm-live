import React from "react"
import { Link } from "gatsby"

import SEO from "../../components/seo"
import Layout from "../../components/layout"

const SecondPage = () => (
  <Layout>
    <div>
      <SEO title="elm-live 2019 survey" />
      <h1>Hi from the second page</h1>
      <p>Welcome to page 2</p>
      <Link to="/">Go back to the homepage</Link>
    </div>
  </Layout>
)

export default SecondPage
