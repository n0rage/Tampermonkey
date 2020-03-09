// ==UserScript==
// @name         Twitter Video link & advertising remove
// @namespace    https://twitter.com/
// @version      0.1.1
// @updateURL    https://raw.githubusercontent.com/n0rage/Tampermonkey/master/twitter.js
// @downloadURL  https://raw.githubusercontent.com/n0rage/Tampermonkey/master/twitter.js
// @description  none
// @author       @no__rage
// @match        https://twitter.com/*
// @run-at       document-idle
// ==/UserScript==

// TEST UPDATE

const getTweets = () => Array.from(document.querySelectorAll('article'))

const getTweetsWithVideo = tweets => tweets.filter(tweet => tweetByMediaType({ tweet, mediaType: 'video' }))

const getTweetssWithGif = tweets => tweets.filter(tweet => tweetByMediaType({ tweet, mediaType: 'gif' }))

const haveMedia = tweet => {

    if (isClosedTweet(tweet) && !isRestrictedTweet(tweet)) {
        return [4, 5].includes(tweet.children[0].children[1].children[1].childElementCount)
    }

    if(isOpenTweet(tweet)) {
        return tweet.children[0].childElementCount === 7
    }

    return false
}

const isClosedTweet = tweet => tweet.children[0].childElementCount === 2

const isOpenTweet = tweet => [6, 7].includes(tweet.children[0].childElementCount)

const isRestrictedTweet = tweet => isClosedTweet(tweet) && tweet.children[0].children[1].childElementCount === 1

const tweetHavePlayButton = tweet => {
    if (haveMedia(tweet)) {
      if (isOpenTweet(tweet)) {
          return Boolean(tweet.children[0].children[3].querySelector('[data-testid="playButton"]'))
      }

      if (isClosedTweet(tweet) && !isRestrictedTweet(tweet)) {
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

        if (isClosedTweet(tweet)) {
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

const haveAnEmbededTweet = tweet => {
    if (isOpenTweet(tweet) && tweetHavePlayButton(tweet)) {
        return Boolean(tweet.children[0].children[3].children[0].querySelector('[role=presentation]'))
    }

    if (isClosedTweet(tweet) && !isRestrictedTweet(tweet) && tweetHavePlayButton(tweet) && !tweetByMediaType({ tweet, mediaType: 'gif' })) {
        return Boolean(tweet.children[0].children[1].children[1].children[2].querySelector('[role=presentation'))
    }

    return false
}

const autoPlayIsActivated = tweet => Boolean(tweet.children[0].querySelector('video'))

const getClosedTweetUrl = tweet => {
    const url = 'https://twitter.com' + tweet.children[0].children[1].children[1].children[0].children[0].children[0].children[2].getAttribute('href') + '/video/1'
    return url
}

const isVideoOwner = ({ tweet, currentUrl, videoUrl }) => {
    if (isOpenTweet(tweet)) {
        return !Boolean(tweet.children[0].children[3].children[0].children[1])
    }

    if (isClosedTweet(tweet) && !isRestrictedTweet(tweet)) {
        return tweet.children[0].children[1].children[1].children[2].children[0].childElementCount === 1 //|| getTweetOwner(currentUrl) === getTweetOwner(videoUrl)
    }

    return false
}

const getTweetOwner = url => {
    const { statusPage } = regexp()
    const captured = url.match(statusPage)
    return captured[1]
}

const getVideoOwner = url => {
    const { user } = regexp()
    const captured = url.match(user)
    return captured[1]
}

const linkSvg = () => '<path d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z"></path><path d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z"></path>'

const copyVideoLink = tempInput => {
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
}

const createTempInputNode = ({ videoUrl, tweetId }) => {
  let tempInput = document.createElement('input')
      tempInput.setAttribute('id', 'input-' + tweetId)
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

const createLinkButtonNode = ({ actionsNode, elementId, linkSvg, tweet }) => {

  const actionNode = actionsNode.children[3]

  const actionNodeClone = actionNode.cloneNode(true)
        actionNodeClone.setAttribute("id", elementId);

        if (tweet.isClosedTweet) {
            actionNodeClone.style = 'margin-left: 55px;'
        }

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

const addCopyUrlButton = ({ elementClone, linkSvg, isOpened }) => {
    if (elementClone && elementClone.tweet && elementClone.haveVideo && elementClone.isVideoOwner) {

        let tweetActions = elementClone.tweet.children[0].children[6]

        if (!isOpened) {

            tweetActions = Boolean(elementClone.tweet.children[0].children[1].children[1].children[4]) ? elementClone.tweet.children[0].children[1].children[1].children[4] : elementClone.tweet.children[0].children[1].children[1].children[3]
        }

        if (!tweetActions.querySelector('#' + elementClone.id)) {
            createLinkButtonNode({ actionsNode: tweetActions, elementId: elementClone.id, linkSvg, tweet: elementClone })
        }
    }
}

const createClickAction = ({ videoUrl, tweetId }) => {
    createTempInputNode({ videoUrl, tweetId })
    copyVideoLink(document.querySelector('#input-' + tweetId))
    createTooltipNode()
}

const regexp = () => ({
    statusPage: /\/(\w+)\/(status+)\/(\d+)/,
    statusPageAndTimelinePage: /\/(\w+)\/(status+)\/(\d+)|\.\w{2,3}\/\w+(\/with_replies)?/,
    searchPage: /search\?q=\w+&src=\w+/,
    homePage: /\/home$/,
    isMp4: /\.mp4$/,
    isBlob: /^blob/,
    tweetId: /\/(\d+)\//,
    user: /\/(\w+)\//
})


const mainFunction = () => {
    const { statusPageAndTimelinePage, searchPage } = regexp()

    if ((statusPageAndTimelinePage).test(location.href) || (searchPage).test(location.href)) {

        const tweets = getTweets()

        if (tweets.length) {
            const tweetsDetails = tweets.reduce((acc, tweet) => {
                const newTweet = {
                    tweet,
                    haveMedia: haveMedia(tweet),
                    haveVideo: tweetByMediaType({ tweet, mediaType: 'video' }),
                    haveGif: tweetByMediaType({ tweet, mediaType: 'gif' }),
                    autoplay: autoPlayIsActivated(tweet),
                    isClosedTweet: isClosedTweet(tweet),
                    currentUrl: location.href,
                    haveAnEmbededTweet: haveAnEmbededTweet(tweet)
                }

                if (newTweet.haveVideo && !newTweet.haveAnEmbededTweet) {
                    newTweet.videoUrl = isClosedTweet(tweet) && !isRestrictedTweet(tweet) ? getClosedTweetUrl(tweet) : location.href + '/video/1'

                    const { tweetId } = regexp()
                    const tweetIdMatch = newTweet.videoUrl.match(tweetId)

                    newTweet.id = 'tweet-id-' + tweetIdMatch[1]
                    newTweet.videoOwner = getVideoOwner(newTweet.videoUrl)
                    newTweet.isVideoOwner = haveMedia(tweet) && isVideoOwner({ tweet, currentUrl: location.href, videoUrl: newTweet.videoUrl})
                }

                acc.push(newTweet)
                return acc
            }, [])

            // console.log(tweetsDetails)

            const tweetIdList = []

            const tweetOpened = tweetsDetails.find(({ tweet }) => isOpenTweet(tweet))

            if (tweetOpened) {
                tweetIdList.push(tweetOpened)
                addCopyUrlButton({ elementClone: tweetOpened, linkSvg, isOpened: true })
            }

            const tweetsClosed = tweetsDetails.filter(({ tweet }) => isClosedTweet(tweet) && !isRestrictedTweet(tweet))
            tweetsClosed.forEach(tweet => {
                tweetIdList.push(tweet)
                addCopyUrlButton({ elementClone: tweet, linkSvg, isOpened: false })
            })

            // console.log(tweetIdList)

            document.addEventListener('click', e => {
                if (e.target && tweetIdList.map(tweet => tweet.id).includes(e.target.id) && !document.querySelector('#input-' + e.target.id)) {
                    const clickedTweet = tweetIdList.find(tweet => tweet.id === e.target.id)
                    createClickAction({ videoUrl: clickedTweet.videoUrl, tweetId: e.target.id })
                }
            })
        }
    }
}

const initApp = () => {
    const mark = document.querySelector('body')
    const observer = new MutationObserver(mainFunction)

    observer.observe(mark, { childList: true, subtree: true, attributes: false, characterData: false })
}

initApp()
