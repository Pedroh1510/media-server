import axios from 'axios'
import { useEffect, useState } from 'react'
import Selector from './components/selector'
import { AppBar, Box, Checkbox, Fab, Toolbar } from '@mui/material'
import ScrollTop from './components/scrollTop'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
// const url = 'http://localhost:3000'
const url = window.location.origin
/**
 * @returns {Promise<{data:Buffer, name:String}[]>}
 */
async function imagesApi(mangaId, chapterId) {
  return axios.get(`${url}/mangas/${mangaId}/${chapterId}/images`).then((res) => res?.data)
}
/**
 * @typedef {{name:String,id:String,read:Boolean,error:Boolean}} Chapter
 * @typedef {{name:String,id:String, Chapters:Chapter[]}} Manga
 * @returns {Promise<Manga[]>}
 */
async function mangasApi() {
  const response = await axios.get(`${url}/mangas`).then((res) => res.data)
  return response.map((manga) => ({
    ...manga,
    Chapters: manga.Chapters.map((item) => ({
      ...item,
      color: item.read ? 'greenyellow' : item.error ? 'red' : 'white',
    })),
  }))
}

async function updateChapter({ chapterId, read, error }) {
  await axios.patch(`${url}/mangas/chapter/${chapterId}`, { read, error })
}

function App(props) {
  const [images, setImages] = useState([])
  const [message, setMessage] = useState('')
  const [mangas, setMangas] = useState([])
  const [view, setView] = useState({ manga: null, chapter: null, chapters: [] })
  const [mangaSelected, setMangaSelected] = useState('')
  const [chapterSelected, setChapterSelected] = useState('')
  const [checkBoxes, setCheckBoxes] = useState({ read: false, error: false })

  useEffect(() => {
    listMangas()
    // getImages()
  }, [])

  async function getImages(mangaId, chapterId) {
    const images = await imagesApi(mangaId, chapterId).catch(() => null)
    if (!images) {
      setMessage('Erro ao consultar images')
      return
    }
    const response = images.map((image) => {
      const data = btoa(new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      return {
        original: `data:image/png;base64,${data}`,
        name: image.name,
      }
    })
    setMessage('')
    setImages(response)
  }

  async function listMangas() {
    const mangas = await mangasApi()
    setMangas(mangas)
    if (view.manga) {
      const manga = mangas.find((manga) => view.manga.id === manga.id)
      if (!manga) return
      setView({
        ...view,
        chapters: manga.Chapters,
      })
    }
  }

  function clear() {
    setChapterSelected(null)
    setImages([])
  }

  const handleChange = (event) => {
    const manga = mangas.find((manga) => manga.id === event.target.value)
    let chapter = view.chapter
    if (mangaSelected !== manga.id) {
      chapter = null
      clear()
    }
    setMangaSelected(event.target.value)
    setView({
      ...view,
      manga: manga,
      chapters: manga.Chapters ?? [],
      chapter,
    })
  }
  const handleChangeChapter = async (event) => {
    clear()
    setChapterSelected(event.target.value)
    const chapter = view.chapters.find((chapter) => chapter.id === event.target.value)
    setView({ ...view, chapter: chapter })
    setCheckBoxes({ read: chapter?.read ?? false, error: chapter?.error ?? false })
    await getImages(view.manga.id, event.target.value)
  }
  const handleChangeCheckbox = async (event, type) => {
    setCheckBoxes({ ...checkBoxes, [type]: event.target.checked })
    await updateChapter({ ...checkBoxes, chapterId: chapterSelected, [type]: event.target.checked })
    await listMangas()
  }
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          style={{ background: '#fff' }}
          sx={{ position: 'fixed', display: 'flex', flexDirection: 'row' }}
        >
          <Toolbar id="back-to-top-anchor">
            <Selector text="Mangas" value={mangaSelected} items={mangas} onChange={handleChange} />
            <Selector
              text="Chapter"
              value={chapterSelected}
              items={view.chapters}
              onChange={handleChangeChapter}
              disable={!view.chapters.length}
            />
            <div style={{ display: 'flex', flexDirection: 'row', color: 'black' }}>
              <p>Capitulo lido</p>
              <Checkbox
                checked={checkBoxes.read}
                onChange={(event) => handleChangeCheckbox(event, 'read')}
                disabled={!chapterSelected}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', color: 'black' }}>
              <p>Capitulo com erro</p>
              <Checkbox
                checked={checkBoxes.error}
                onChange={(event) => handleChangeCheckbox(event, 'error')}
                disabled={!chapterSelected}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ paddingTop: '70px' }}>
        {!message
          ? images.map((image) => (
              <Box key={image.name}>
                <img key={image.name} alt={image.name} src={image.original} />
              </Box>
            ))
          : message}
      </Box>
      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  )
}

export default App
