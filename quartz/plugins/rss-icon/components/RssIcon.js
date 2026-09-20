import { h } from "preact"

const RSS_URL = "https://wiki.da1234cao.space/index.xml"

const RssIcon = ({ displayClass }) => {
  return h(
    "a",
    {
      class: displayClass ? `${displayClass} rssicon` : "rssicon",
      href: RSS_URL,
      title: "RSS",
      "aria-label": "RSS",
    },
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
      },
      h("path", {
        d: "M5 3a2 2 0 1 0 0 4 12 12 0 0 1 12 12 2 2 0 1 0 4 0C21 10.16 13.84 3 5 3Zm0 7a2 2 0 1 0 0 4 5 5 0 0 1 5 5 2 2 0 1 0 4 0c0-4.97-4.03-9-9-9Zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
      }),
    ),
  )
}

RssIcon.css = `
.rssicon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 32px;
  flex-shrink: 0;
  color: var(--darkgray);
}

.rssicon:hover {
  color: var(--dark);
}

.rssicon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  transition: color 0.1s ease;
}
`

export default () => RssIcon
