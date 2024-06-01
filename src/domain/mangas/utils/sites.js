export const sites = {
  '3xyaoi': {
    url: 'https://3xyaoi.com/xxx/',
    selectors: {
      nextPage:
        'body > div.wrap > div > div.site-content > div > div > div > div > div > div > div.c-blog-listing.c-page__content.manga_content > div > div > div.col-12.col-md-12 > div > a.nextpostslink',
      content: '#loop-content > div > div > div > div > div.item-summary > div.post-title.font-title > h3 > a',
      ep: 'body > div.wrap > div > div.site-content > div > div.c-page-content.style-1 > div > div > div > div > div > div.c-page > div.c-page__content > div.page-content-listing.single-page > div > ul > li > a',
      image:
        'body > div.wrap > div > div.site-content > div > div > div > div > div > div > div.c-blog-post > div.entry-content > div > div > div > div> img',
    },
  },
  yanpfansub: {
    url: 'https://yanpfansub.com/',
    selectors: {
      nextPage:
        'body > div.wrap > div > div.site-content > div > div > div > div > div.main-col.col-md-8.col-sm-8 > div.main-col-inner.c-page > div.c-blog-listing.c-page__content.manga_content > div > div > div.col-12.col-md-12 > div > a.nextpostslink',
      content: '#loop-content > div > div > div > div > div.item-summary > div.post-title.font-title > h3 > a',
      ep: '#manga-chapters-holder > div.page-content-listing.single-page > div > ul > li > a',
      image:
        'body > div.wrap > div > div.site-content > div > div > div > div > div > div > div.c-blog-post > div.entry-content > div > div > div > div > img',
    },
  },
  manganelo: {
    url: 'https://m.manganelo.com/genre-all-update-latest',
    selectors: {
      nextPage: 'body > div.body-site > div.container.container-main > div.panel-page-number > div.group-page > a',
      numberPage: '1',
      content: 'body > div.body-site > div.container.container-main > div.panel-content-genres > div > div > h3 > a',
      ep: 'body>div>div>div>div>ul>li>a',
      image: 'body > div.body-site > div.container-chapter-reader > img',
    },
    browserContent: {
      headers: {
        Referer: 'https://chapmanganelo.com/',
      },
    },
  },
  comiko: {
    url: 'https://comiko.net/browse?langs=pt_br,pt,en',
    baseUrl: 'https://comiko.net',
    selectors: {
      nextPage: '#mainer > div > div.my-5.ms-auto.d-flex.justify-content-end > nav.d-none.d-md-block > ul > li',
      numberPage: '1',
      content: '#series-list > div > div > a',
      ep: '#mainer > div.container-fluid.container-max-width-xl > div.mt-4.episode-list > div.main > div > a',
      epName: '#mainer > div.container-fluid.container-max-width-xl > div.mt-4.episode-list > div.main > div > a > b',
      image: '#viewer > div > img',
    },
  },
  gooffansub: {
    url: 'https://gooffansub.com/',
    selectors: {
      nextPage:
        'body > div.wrap > div > div.site-content > div > div > div > div > div > div.main-col-inner.c-page > div.c-blog-listing.c-page__content.manga_content > div > div > div.col-12.col-md-12 > div > a.nextpostslink',
      content: '#loop-content > div > div > div > div > div.item-summary > div.post-title.font-title > h3 > a',
      ep: '#manga-chapters-holder > div.page-content-listing.single-page > div > ul > li > a',
      image:
        'body > div.wrap > div > div.site-content > div > div > div > div > div > div > div.c-blog-post > div.entry-content > div > div > div > div > img',
    },
  },
  mto: {
    url: 'https://mto.to/browse?langs=pt_br,pt,en',
    baseUrl: 'https://mto.to',
    selectors: {
      nextPage: '#mainer > div > div.my-5.ms-auto.d-flex.justify-content-end > nav.d-none.d-md-block > ul > li',
      numberPage: '1',
      content: '#series-list > div > div > a',
      ep: '#mainer > div.container-fluid.container-max-width-xl > div.mt-4.episode-list > div.main > div > a',
      epName: '#mainer > div.container-fluid.container-max-width-xl > div.mt-4.episode-list > div.main > div > a > b',
      image: '#viewer > div > img',
    },
  },
  mangabuddy: {
    url: 'https://mangabuddy.com/latest',
    baseUrl: 'https://mangabuddy.com',
    selectors: {
      nextPage: 'body > div.layout > div.main-container > div > div.d-flex > div:nth-child(4) > div > a',
      numberPage: '1',
      content:
        'body > div.layout > div.main-container > div > div.d-flex > div.section.mt-1 > div > div > div > div > div.meta > div.title > h3 > a',
      ep: `#chapter-list > li > a`,
      epName: `#chapter-list > li > a > div > strong`,
      moreEp: '#show-more-chapters > span',
      image: '#chapter-images > div > img',
    },
  },
  sinensistoon: {
    url: 'https://sinensistoon.com/todas-as-obras/',
    selectors: {
      content: 'body > main > section > div > a.titulo__comic__allcomics',
      ep: "body > main > section.capitulos__obra > ul > a', 'body > main > section.capitulos__obra > ul > a > li > div > span",
      image: '#imageContainer > img',
    },
  },
  mangaschan: {
    url: 'https://mangaschan.net/manga',
    selectors: {
      content: '#content > div > div.postbody > div.bixbox.seriesearch > div.mrgn > div.listupd > div > div > a',
      contentName:
        '#content > div > div.postbody > div.bixbox.seriesearch > div.mrgn > div.listupd > div > div > a > div.bigor > div.tt',
      nextButton: '#content > div > div.postbody > div.bixbox.seriesearch > div.mrgn > div.hpage > a.r',
      ep: '#chapterlist > ul > li > div > div > a',
      epName: '#chapterlist > ul > li > div > div > a > span.chapternum',
      image: '#readerarea > img',
      selectMode: {
        key: '#readingmode',
        value: 'full',
      },
    },
    browserContent: {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Cookie:
          'cf_clearance=kzQ6OU1TjMtIa0N2EJyD7pDYBYo3YBYmP5n6ZdcXiEc-1717120170-1.0.1.1-VXTzLfDsQon6XT7XJRswCXqssAgBcxqt.d5WbHiqnj9rFyznxENyjhJiDqn6TAHhZF7wkw2WGjgYFHVgSodRAA',
      },
    },
  },
  webtoons: {
    url: 'https://www.webtoons.com/en/canvas/list?genreTab=ALL&sortOrder=',
    baseUrl: 'https://www.webtoons.com',
    selectors: {
      content: '#content > div.cont_box.v2 > div.challenge_cont_area > div:nth-child(2) > ul > li > a',
      contentName: '#content > div.cont_box.v2 > div.challenge_cont_area > div:nth-child(2) > ul > li > a > p.subj',
      nextPage: '#content > div.cont_box.v2 > div.challenge_cont_area > div.paginate > a',
      numberPage: '1',
      ep: '#_listUl > li > a',
      nextPageEp: '#content > div.cont_box > div.detail_body.banner > div.detail_lst > div.paginate > a',
      numberPageEp: '1',
      epName: '#_listUl > li > a > span.subj > span',
      image: '#_imageList > img',
    },
    browserContent: {
      headers: {
        Referer: 'https://www.webtoons.com',
      },
    },
  },
  slimeread: {
    url: 'https://slimeread.com/',
    baseUrl: 'https://slimeread.com',
    selectors: {
      ep: '#__next > div > main > section:nth-child(7) > div.mt-2 > div > div.flex.flex-col > div > div > div > div > a',
      epName:
        '#__next > div > main > section:nth-child(7) > div.mt-2 > div > div.flex.flex-col > div > div > div > div > a > div > h2',
      moreEp:
        '#__next > div > main > section:nth-child(7) > div.mt-2 > div > div.flex.flex-col > div > div > div.flex.flex-1.mt-4.justify-center > div',
    },
    browserContent: {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Cookie:
          "nextbooks.zoom=1; nextbooks.brilho=100; baselime-session-id=1d0d791c-01f7-45aa-82fa-58090a7a9f94; cf_clearance=kzQ6OU1TjMtIa0N2EJyD7pDYBYo3YBYmP5n6ZdcXiEc-1717120170-1.0.1.1-VXTzLfDsQon6XT7XJRswCXqssAgBcxqt.d5WbHiqnj9rFyznxENyjhJiDqn6TAHhZF7wkw2WGjgYFHVgSodRAA; nextbooks.random=%7B%22link%22%3A%2211721%2FI-Stole-the-First-Ranker's-Soul%22%2C%22name%22%3A%22I-Stole-the-First-Ranker's-Soul%22%7D",
      },
    },
  },
  bato: {
    url: 'https://bato.to/v3x-search',
    baseUrl: 'https://bato.to',
    selectors: {
      content:
        '#app-wrapper > main > div.grid.grid-cols-1.gap-5.border-t.border-t-base-200.pt-5 > div > div.pl-3.grow.flex.flex-col.overflow-hidden.group.space-y-1 > h3 > a',
      contentName:
        '#app-wrapper > main > div.grid.grid-cols-1.gap-5.border-t.border-t-base-200.pt-5 > div > div.pl-3.grow.flex.flex-col.overflow-hidden.group.space-y-1 > h3 > a > span',
      nextPage: '#app-wrapper > main > div.flex.items-center.flex-wrap.space-x-1.my-10.justify-center > a',
      numberPage: '1',
      ep: '#app-wrapper > main > div:nth-child(3) > astro-island > div > div:nth-child(2) > div > div > astro-slot > div > div.space-x-1 > a',
      image: '#app-wrapper > astro-island:nth-child(4) > div > div > div > div > img',
      selectMode: {
        key: '#app-wrapper > div:nth-child(3) > div > div:nth-child(2) > div > select:nth-child(2)',
        value: '2',
      },
    },
  },
}
