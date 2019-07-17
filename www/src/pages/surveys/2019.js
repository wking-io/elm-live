import React, { useState } from "react"
import { Link } from "gatsby"

import SEO from "../../components/seo"

import { LogoIcon, WebIcon } from "../../components/icons"

const SurveyPage = () => {
  const [showHow, updateHow] = useState(null)
  return (
  <div className="bg-grey-light font-sans px-8">
    <SEO title="2019 Survey | elm-live" />
    <div className="max-w-xl mx-auto">
      <nav className="bg-grey-light w-full mb-16">
        <div className="flex justify-between items-center pt-8 border-b-2 border-black max-w-4xl mx-auto pb-4">
          <Link to='/'>
            <h1 className="flex items-center font-bold">
              <span className="h-8 mr-2"><LogoIcon /></span>
              <span className="leading-none">elm-live</span>
            </h1>
          </Link>
          <ul className="flex">
            <li className="h-4 w-auto"><a href="https://wking.io"><WebIcon/></a></li>
          </ul>
        </div>
      </nav>
      <h1 className="font-bold text-2xl mb-8">2019 Survey</h1>
      <form name="2019-survey" method="POST" action="/surveys/2019-thank-you" netlify-honeypot="bot-field" data-netlify="true" className="w-full">
        <input type="hidden" name="form-name" value="2019-survey" />
        <p class="absolute h-0 w-0 left-0 opacity-0">
          <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
        </p>
        <div className="flex flex-col mb-8">
          <label className="mb-4" htmlFor="biggest-problem">What is the biggest problem you have with Elm development?</label>
          <textarea className="p-3 border-2 border-grey rounded h-32" name="biggest-problem" id="biggest-problem"></textarea>
        </div>
        <fieldset className="mb-8">
          <legend className="mb-4">What <code>elm-live</code> flags do you use consistently? (Select as many as apply)</legend>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="path-to-elm" value="1" name="path-to-elm" />
            <label className="ui-checkbox__label w-full" htmlFor="path-to-elm">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--path-to-elm</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="port" value="1" name="port" />
            <label className="ui-checkbox__label w-full" htmlFor="port">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--port</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="host" value="1" name="host" />
            <label className="ui-checkbox__label w-full" htmlFor="host">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--host</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="dir" value="1" name="dir" />
            <label className="ui-checkbox__label w-full" htmlFor="dir">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--dir</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="start-page" value="1" name="start-page" />
            <label className="ui-checkbox__label w-full" htmlFor="start-page">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--start-page</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="ssl" value="1" name="ssl" />
            <label className="ui-checkbox__label w-full" htmlFor="ssl">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--ssl</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="ssl-cert" value="1" name="ssl-cert" />
            <label className="ui-checkbox__label w-full" htmlFor="ssl-cert">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--ssl-cert</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="ssl-key" value="1" name="ssl-key" />
            <label className="ui-checkbox__label w-full" htmlFor="ssl-key">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--ssl-key</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="proxy-prefix" value="1" name="proxy=prefix" />
            <label className="ui-checkbox__label w-full" htmlFor="proxy-prefix">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--proxy-prefix</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="proxy-host" value="1" name="proxy-host" />
            <label className="ui-checkbox__label w-full" htmlFor="proxy-host">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--proxy-host</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="hot" value="1" name="hot" />
            <label className="ui-checkbox__label w-full" htmlFor="hot">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--hot</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="verbose" value="1" name="verbose" />
            <label className="ui-checkbox__label w-full" htmlFor="verbose">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--verbose</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="open" value="1" name="open" />
            <label className="ui-checkbox__label w-full" htmlFor="open">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--open</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="pushstate" value="1" name="pushstate" />
            <label className="ui-checkbox__label w-full" htmlFor="pushstate">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--pushstate</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="no-reload" value="1" name="no-reload" />
            <label className="ui-checkbox__label w-full" htmlFor="no-reload">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--no-reload</code></span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="checkbox" id="no-server" value="1" name="no-server" />
            <label className="ui-checkbox__label w-full" htmlFor="no-server">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm"><code>--no-server</code></span>
            </label>
          </div>
        </fieldset>
        <fieldset className="mb-8">
          <legend className="mb-4">Have you ever used the <code>--before-build</code> or <code>--after-build</code> flags?</legend>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="radio" value="yes" id="yes" name="before-after[]" onChange={() => updateHow(true)} checked={showHow} />
            <label className="ui-checkbox__label w-full" htmlFor="yes">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm">Yes</span>
            </label>
          </div>
          <div className="ui-checkbox mb-2 flex">
            <input className="ui-checkbox__input" type="radio" value="no" id="no" name="before-after[]" onChange={() => updateHow(false)} checked={showHow === false} />
            <label className="ui-checkbox__label w-full" htmlFor="no">
              <span className="block relative z-10 bg-white rounded py-3 px-6 text-sm">No</span>
            </label>
          </div>
        </fieldset>
        { showHow ? <div className="flex flex-col mb-8">
          <label className="mb-4" htmlFor="before-after-how">Which one did you use and how?</label>
          <textarea className="p-3 border-2 border-grey rounded h-32" name="before-after-how" id="before-after-how"></textarea>
        </div> : null }
        <div className="flex flex-col mb-8">
          <label className="mb-4" htmlFor="other-thoughts">Do you have anything else you would like to share about development in elm?</label>
          <textarea className="p-3 border-2 border-grey rounded h-32" name="other-thoughts" id="other-thoughts"></textarea>
        </div>
        <input className="btn btn--primary block mb-12 rounded cursor-pointer" type="submit" value="Submit Survey" />
      </form>
      <div className="h-px bg-black mb-6"></div>
      <p className="text-center pb-12"><Link className="underline hover:no-underline" to="/">Go back to the homepage</Link></p>
    </div>
  </div>
  )
}

export default SurveyPage
