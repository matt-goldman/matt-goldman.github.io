# Breakdown of logn page

```js
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
```
Easy enough. This is a div using utlitiy classes from Tailwind to create a flexbox. That's really all for layout. And we can see it's got a background gradient. We can define a brush for that.

Step 1: create the gradient brushes

Step 2: ~~create a control template for the pages~~
Nah easier to just set it as the background on each page



```js
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
```
This is cool - just a subtle animation when the page loads. We can easily replictae this with .NET MAUI

Step 3: Add a VerticalStackLayout (don't need FlexLayout here)
Give it a key, add animation to it in the code behind

```js
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4"
          >
            <Recycle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to OpenCurby</h1>
          <p className="text-gray-600 dark:text-gray-400">Turn your recycling into rewards</p>
        </div>
```
This is the page header. It contains the recycle logo. This comes from a custom UI component which we can look at later. It's got some animation, it's got a heading and a welcome message. We can use styles for these.

Step 4 - VerticalStackLayout within a VerticalStackLayout? Or change top level to FlexLayout?

Change - let's align with the code from v0.

Ok - Recycle comes from Lucide React, it's not a custom component. Mark this as todo, screenshot and image for now.

```js
        {/* Login Form */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
          </CardHeader>
```
This is a card control. We can inspect the componet to see how that's build. the border here is interesting, the classes are defined here instead of in the control.

```js
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </Label>
              </div>
```
Labels and inputs. Simple.

```js
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
```

The last part uses a custom button component. It's got some flexibility in that it allows different styling based on type. We'll just use explicit styles.

First he layout then the controls
