const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const expressSanitizer = require('express-sanitizer')
const app = express()

mongoose.connect('mongodb://localhost/restful_blog')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(expressSanitizer())

const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

const Blog = mongoose.model('Blog', blogSchema)

app.get('/', (req, res) => {
    res.redirect('/blogs')
})

// LIST ROUTE
app.get('/blogs', async (req, res) => {
    const blogs = await Blog.find({})

    if (!blogs) {
        throw new Error('ERROR retrieving blogs content from the database')
    } else {
        res.render('index', {blogs: blogs})
    }
    
})

// NEW ROUTE
app.get('/blogs/new', (req, res) => {
    res.render('new')
})

// CREATE ROUTE
app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    let data = req.body.blog;

    Blog.create(data, (err, newBlog) => {
        if (err) {
            res.render('new')
        } else {
            res.redirect('/blogs')
        }
    })
})

// SHOW ROUTE
app.get('/blogs/:id',  async (req, res) => {
    let blog = await Blog.findById(req.params.id)

    if (!blog) {
        throw new Error('ERROR: Cannot retrieve blog from database!')
    } else {
        res.render('show', {blog: blog})
    }
})

// EDIT AND UPDATE ROUTES
app.get('/blogs/:id/edit', async (req, res) => {
    let blog = await Blog.findById(req.params.id)

    res.render('edit', {blog: blog})
})

app.put('/blogs/:id', async (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    let updated = await Blog.findByIdAndUpdate(req.params.id, req.body.blog)

    if (!updated) {
        throw new Error('ERROR: Cannot update blog in the database!')
    } else {
        res.redirect('/blogs/' + req.params.id)
    }
})

// DELETE ROUTE 
app.delete('/blogs/:id', async (req, res) => {
    let response = await Blog.findByIdAndDelete(req.params.id)
    
    if (!response) {
        throw new Error('ERROR occured while trying to delete post!')
    }
    res.redirect('/blogs')
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})