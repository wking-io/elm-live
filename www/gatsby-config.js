require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: 'Live reloading server for Elm development',
    titleTemplate: "%s | elm-live",
    description: 'Documentation and more for elm-live, a dev server for elm development with live reloading.',
    url: "https://www.elm-live.com",
    image: "/images/elm-live.jpg",
    twitterUsername: "@wking__",
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'elm-live-docs',
        short_name: 'elm-live',
        start_url: '/',
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        display: 'minimal-ui',
        icon: 'src/images/elm-live-icon.png' // This path is relative to the root of the site.
      }
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        typeName: 'Github',
        fieldName: 'github',
        url: 'https://api.github.com/graphql',
        headers: {
          Authorization: `bearer ${process.env.GITHUB_TOKEN}`
        },
        fetchOptions: {}
      }
    },
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `Fira Mono`,
            subsets: [`latin`],
            variants: [`400`],
            formats: [`woff`, `woff2`],
          },
          {
            family: `Fira Sans`,
            subsets: [`latin`],
            variants: [`400`, `400i`, `500`, `500i`, `700`, `700i`],
            formats: [`woff`, `woff2`],
          },
        ],
      },
    },
    'gatsby-plugin-postcss',
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    'gatsby-plugin-offline',
  ]
}
