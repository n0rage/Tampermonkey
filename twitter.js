// ==UserScript==
// @name         Twitter Video link & advertising remove
// @namespace    https://twitter.com/
// @version      0.1
// @updateURL    https://github.com/n0rage/Tampermonkey/blob/master/twitter.js
// @downloadURL  https://github.com/n0rage/Tampermonkey/blob/master/twitter.js
// @description  none
// @author       @no__rage
// @match        https://twitter.com/*
// @run-at       document-idle
// ==/UserScript==

const getTweets = () => Array.from(document.querySelectorAll('article'))

const getTweetsWithVideo = tweets => tweets.filter(tweet => tweetByMediaType({ tweet, mediaType: 'video' }))

const getTweetssWithGif = tweets => tweets.filter(tweet => tweetByMediaType({ tweet, mediaType: 'gif' }))

const haveMedia = tweet => {
    if (isSimplifiedTweet(tweet) && !isRestrictedTweet(tweet)) {
        return tweet.children[0].children[1].children[1].childElementCount === 4
    }

    if(isOpenTweet(tweet)) {
        return tweet.children[0].childElementCount === 7
    }

    return false
}

const isSimplifiedTweet = tweet => tweet.children[0].childElementCount === 2

const isOpenTweet = tweet => [6, 7].includes(tweet.children[0].childElementCount)

const isRestrictedTweet = tweet => isSimplifiedTweet(tweet) && tweet.children[0].children[1].childElementCount === 1

const tweetHavePlayButton = tweet => {

    if (haveMedia(tweet)) {
      if (isOpenTweet(tweet)) {
          return Boolean(tweet.children[0].children[3].querySelector('[data-testid="playButton"]'))
      }

      if (isSimplifiedTweet(tweet)) {
          return Boolean(tweet.children[0].querySelector('[data-testid="playButton"]'))
      }

      return false
    }

    return false
}

const tweetByMediaType = ({ tweet, mediaType }) => {

    if (tweetHavePlayButton(tweet)) {

        let playButton = null

        if (isOpenTweet(tweet)) {
             playButton = tweet.children[0].children[3].querySelector('[data-testid="playButton"]')
        }

        if (isSimplifiedTweet(tweet)) {
             playButton = tweet.children[0].querySelector('[data-testid="playButton"]')
        }

        const playButtonAriaLabel = playButton.getAttribute('aria-label')

        if (mediaType === 'gif') {
            return (/.+ GIF$/).test(playButtonAriaLabel)
        }

        if (mediaType === 'video') {
            return !(/.+ GIF$/).test(playButtonAriaLabel)
        }
    }

    if (autoPlayIsActivated(tweet)) {
        const videoNode = tweet.children[0].querySelector('video')

        const { isMp4, isBlob } = regexp()

        const isGif = (isMp4).test(videoNode.getAttribute('src'))
        const isVideo = (isBlob).test(videoNode.getAttribute('src'))

        if (mediaType === 'gif') {
            return isGif
        }

        if (mediaType === 'video') {
            return isVideo
        }
    }

    return false
}

const autoPlayIsActivated = tweet => Boolean(tweet.children[0].querySelector('video'))

const isVideoOwner = tweet => {
    let videoElement = null

    if (isOpenTweet(tweet)) {
        videoElement = tweet.children[0].children[3]
        return [1, 2, 4].includes(videoElement.querySelectorAll('[dir="auto"]').length)
    }

    if (isSimplifiedTweet(tweet) && !isRestrictedTweet(tweet)) {
        videoElement = tweet.children[0].children[1].children[1].children[2]
        return [1, 2, 4].includes(videoElement.querySelectorAll('[dir="auto"]').length)
    }

    return false
}

const getTweetOwner = url => {
    const { statusPage } = regexp()
    const captured = url.match(statusPage)
    return captured[1]
}

const regexp = () => ({
    statusPage: /\/(\w+)\/(status+)\/(\d+)/,
    searchPage: /search\?q=\w+&src=\w+/,
    homePage: /\/home$/,
    isMp4: /\.mp4$/,
    isBlob: /^blob/
})

const linkSvg = () => '<path d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z"></path><path d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z"></path>'

const copyVideoLink = tempInput => {
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
}

const createTempInputNode = videoUrl => {
  let tempInput = document.createElement('input')
      tempInput.style = "position: absolute; left: -1000px; top: -1000px"
      tempInput.value = videoUrl

  document.body.appendChild(tempInput)
  return tempInput
}

const createTooltipNode = () => {
  let divInput = document.createElement('div')
      divInput.style = "border-radius: 5px; font-family: Helvetica Neue, Arial; background: rgb(29, 161, 242); color: #fff; bottom: 30px; position: fixed; z-index: 100; padding: 10px 20px; left: 50%; transform: translate(-50%, 0);"
      divInput.textContent = 'Copié dans le Presse-papiers'

  document.body.appendChild(divInput)
  setTimeout(() => document.body.removeChild(divInput), 5000)
}

const createLinkButtonNode = ({ actionsNode, elementId, linkSvg }) => {

  const actionNode = actionsNode.children[3]

  const actionNodeClone = actionNode.cloneNode(true)
        actionNodeClone.setAttribute("id", elementId);
        actionNodeClone.querySelector('g').innerHTML = linkSvg()
        actionNodeClone.children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].children[1].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].children[1].children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].children[1].children[0].children[0].setAttribute('id', elementId)
        actionNodeClone.children[0].children[0].children[0].children[1].children[0].children[1].setAttribute('id', elementId)

        actionNode.insertAdjacentHTML('afterend', actionNodeClone.outerHTML)
}

const mainFunction = mutations => {
    const { statusPage } = regexp()

    if ((statusPage).test(location.href)) {

        const tweets = getTweets()

        if (tweets.length) {
            const tweetsDetails = tweets.reduce((acc, tweet) => {
                const newTweet = {
                    tweet,
                    haveMedia: haveMedia(tweet),
                    haveVideo: tweetByMediaType({ tweet, mediaType: 'video' }),
                    haveGif: tweetByMediaType({ tweet, mediaType: 'gif' }),
                    isVideoOwner: haveMedia(tweet) && isVideoOwner(tweet),
                    autoplay: autoPlayIsActivated(tweet),
                    owner: getTweetOwner(location.href)
                }

                if (isOpenTweet(tweet) && newTweet.haveVideo) {
                    newTweet.videoUrl = location.href + '/video/1'
                }

                acc.push(newTweet)
                return acc
            }, [])

            const tweetOpened = tweetsDetails.find(({ tweet }) => isOpenTweet(tweet))

            if (tweetOpened.tweet && tweetOpened.haveVideo && tweetOpened.isVideoOwner) {

                const tweetActions = tweetOpened.tweet.children[0].children[6]

                if (!tweetActions.querySelector('#copy-video-url')) {
                    createLinkButtonNode({ actionsNode: tweetActions, elementId: 'copy-video-url', linkSvg })
                }

                document.addEventListener('click', e => {
                    if (e.target && e.target.id === 'copy-video-url') {
                        const tempInput = createTempInputNode(tweetOpened.videoUrl)
                        copyVideoLink(tempInput)
                        createTooltipNode()
                    }
                })
            }
        }
    }
}

const initApp = () => {
    const mark = document.querySelector('body')
    const observer = new MutationObserver(mainFunction)

    observer.observe(mark, { childList: true, subtree: true, attributes: false, characterData: false })
}

initApp()
