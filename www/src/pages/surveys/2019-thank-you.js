import React from "react"
import { Link } from "gatsby"

import SEO from "../../components/seo"

import { LogoIcon, WebIcon } from "../../components/icons"

const SurveyThankYouPage = () => (
  <div className="bg-grey-light font-sans min-h-screen">
    <SEO title="2019 Survey | elm-live" />
    <div className="max-w-xl mx-auto px-8">
      <nav className="bg-grey-light w-full mb-16">
        <div className="flex justify-between items-center pt-8 border-b-2 border-black max-w-4xl mx-auto">
          <h1 className="flex items-center font-bold mb-4">
            <span className="h-8 mr-2"><LogoIcon /></span>
            <span className="leading-none">elm-live</span>
          </h1>
          <ul className="flex">
            <li className="h-4 w-auto"><a href="https://wking.io"><WebIcon/></a></li>
          </ul>
        </div>
      </nav>
      <h1 className="font-bold text-2xl mb-4">Get Updated On The Results!</h1>
      <p className="leading-relaxed mb-8">This is totally optional, but if you would like to be updated with the final results of the survey you can subscribe to the updates using the form below.</p>
      <form action="https://tinyletter.com/wking_io" method="post" target="popupwindow" onsubmit="window.open('https://tinyletter.com/wking_io', 'popupwindow', 'scrollbars=yes,width=800,height=600'); return true">
        <p className="font-bold mb-4">
          <label htmlFor="tlemail">Enter your email address</label>
        </p>
        <p className="mb-6">
          <input className="border-2 border-grey w-full p-3 rounded" type="email" name="email" id="tlemail" />
        </p>
        <input type="hidden" value="1" name="embed"/>
        <input className="btn btn--primary block mb-12 rounded" type="submit" value="Subscribe" />
      </form>
      <div className="h-px bg-black mb-6"></div>
      <p className="text-center pb-12"><Link className="underline hover:no-underline" to="/">Go back to the homepage</Link></p>
    </div>
  </div>
  )

export default SurveyThankYouPage
