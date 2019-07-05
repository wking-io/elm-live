// Dependencies
import React from "react"

// Components
import SEO from "../components/seo"
import Layout from "../components/layout"

// Assets
import './style.css'

export const HeadingLinkBase = location => ({ children, linkId, className }) => (
  <div className={`heading-link flex relative ${className}`}>
    <a className="heading-link__icon absolute w-5 opacity-0" href={`${location}#${linkId}`}>
      <svg class="w-full h-auto" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 12'>
        <path className="text-grey-dark fill-current" d='M18,0H13.2V2.4H18a3.6,3.6,0,1,1,0,7.2H13.2V12H18A6,6,0,0,0,18,0ZM10.8,9.6H6A3.6,3.6,0,0,1,6,2.4h4.8V0H6A6,6,0,0,0,6,12h4.8ZM7.2,4.8h9.6V7.2H7.2Z' />
      </svg>
    </a>
    <div>{children}</div>
  </div>
)

const IndexPage = ({ location }) => {
  console.log(location)
  const HeadingLink = HeadingLinkBase(location.href);
  return (
    <Layout>
      <SEO title="elm-live | Live reloading server for Elm development" />
      <div class="max-w-4xl mx-auto">
        <HeadingLink className="mb-6" linkId="getting-started"><h2 className="text-3xl font-bold" id="geting-started"># Getting Started</h2></HeadingLink>
        <pre className="code bg-grey leading-none text-sm mb-6">
          <code>elm-live &lt;elm-file&gt; [other-elm-files...] [flags] [--] [elm make flags]</code>
        </pre>
        <p className="leading-relaxed mb-8">Although all the flags are broken down in the documentation below I want to cover the different parts of the command you see above so that there is nothing left you need to assume or guess at:</p>
        <HeadingLink className="mb-4" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># elm-live</h3></HeadingLink>
        <p className="leading-relaxed mb-8">This is the name of the binary that is installed either to your local or global path.</p>
        <HeadingLink className="mb-4" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># &lt;elm-file&gt;</h3></HeadingLink>
        <p className="leading-relaxed mb-8">This represents the one required argument and is the path to the Elm file you want to compile. This file path gets passed directly to elm make.</p>
        <HeadingLink className="mb-4" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># [other-elm-files...]</h3></HeadingLink>
        <p className="leading-relaxed mb-8">This represents the potentially infinite, but completely optional other Elm files you want to compile, E.g. <code className="font-mono">elm-live src/Main.elm src/Widget.elm src/Tool.elm</code>.</p>
        <HeadingLink className="mb-4" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># [--] [elm make flags]</h3></HeadingLink>
        <p className="leading-relaxed mb-8">This represents the optional <code>elm-live</code> specific flags that help manage how the server is setup. See below for docs on how these are used.</p>
        <HeadingLink className="mb-4" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># [--] [elm make flags]</h3></HeadingLink>
        <p className="leading-relaxed mb-8">These come as a package deal. Both are optional, but you cannot have one without the other. The <code>--</code> allows us to capture all flags after it into a single bucket. We use it to group the <code>elm make</code> flags and pass them right into the command. This keeps all <code>elm make</code> flags future proof. If Elm releases new flags for <code>elm make</code> they will be immediately avaialble for use in <code>elm-live</code> without needing to upgrade since we do not depend on parsing the flags in our source code. See below for docs on what <code>elm make</code> flags are available and how they are used.</p>
        <HeadingLink className="mb-4" linkId="documentation"><h2 className="text-3xl font-bold" id="documentation"># Flags</h2></HeadingLink>
        <HeadingLink className="mb-6" linkId=""><h3 className="text-2xl font-bold" id="geting-started-elm-live"># --port, -p</h3></HeadingLink>
        <pre className="code bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --port=1234</code>
        </pre>
        <p className="mb-4"><strong>Default: 4000</strong></p>
        <p className="leading-relaxed mb-8">Set the port that the elm-live server is listening for requests at. If the default port used by elm-live is already in use this flag gives you a backdoor to pass in a port that is not in use. In the example above the url that your elm project would be available at would be <code>http://localhost::1234</code>.</p>
      </div>
    </Layout>
  )
}

export default IndexPage
