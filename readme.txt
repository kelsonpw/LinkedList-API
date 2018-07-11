We are now using a package for validation.  We wrote it by hand to learn how annoying it is.

Just a couple of assertions leads to a ton of code.
One of the hardest parts of being a developer is making everyhting, the input works.  Making sure the output is correct.

A big portion of Michaels back end developing was spent in validation, error handling, and testing.

These are the last things we need to know as backend devs.  The rest of the stuff is just tools.  You can learn alot of that stuff on the job.

He demonstrated his solution code for cats api validation.  Hi Kelley ;).  It is in the repo he sent out.

Status codes:
100 --> he dint know dis one but he sed it dont matter at all
200 --> here you go (informational), nobody really talks about these apparently (got something)
300 --> go away (redirected to something)
400 --> you goofed up (user error)
500 --> i goofed up (server error)

401-unauthorized
403-forbidden
404
405-method not allowed
418-im a teapot
420-enhance your calm

200-ok
201-created
202-accepted

500-internal server error
504-bad gateway

the package we are using is called JSONschema

JSONschema is a standard for json apis.  It works in many other backends.  Everyone uses json.

For any json doc there is a way to represent this as a SCHEMA!!

jsonschema.net

