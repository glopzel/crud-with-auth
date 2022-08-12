const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

// @description show add page
// @route GET stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @description PROCESS ADD FORM
// @route POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    // we add a value of user to the body
    req.body.user = req.user.id;
    // reuse the Story model with the create method, we will populate the fields with the body info that comes from the request
    await Story.create(req.body);
    // once we submit we post the story and go back to the dashboard to see it listed out
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// show all public stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    // look for stories with status of public
    const stories = await Story.find({ status: "public" })
      .populate("user") // you grab the user data
      .sort({ createdAt: "desc" }) // sort according to creation date
      .lean(); // takes it from mongo obj and turns it into json, trims the fat

    // handlebars pulls it into individual components
    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// show a single story
router.get("/:id", ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id)
            .populate('user')
            .lean()
        
            if (!story) {
                return res.render('error/404');
            }

            res.render('stories/show', {
                story
            })
    } catch(err) {
        console.error(err)
        res.render('error/404')
    }
});

// @desc show edit page
// @rout GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    // when they click the edit button the correct story must be displayed
    // find => looks for more than 1
    // findOne => looks for 1
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    // if there is no story then render an error page
    if (!story) {
      return res.render("error/404");
    }

    // if its not the story owner
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      // render a new page named edit
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//@desc update story
// @route PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    // check if story is there
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    // if its not the story owner
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      // find the story by the id from the request, we replace it with the body of the request, if we try to update something that doesnt exist we create a new one, and the validators are running (this required run again)
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @∂esc delete story
// @route DELETE /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @∂esc User stories
// @route GET stories/user/:id
router.get("/user/:userId", ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',

        })
        .populate('user').lean()

        res.render('stories/index', {
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
  });

module.exports = router;
