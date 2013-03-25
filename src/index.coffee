class PoolParty 

  ###
  ###

  constructor: (options = {}) ->

    @max          = options.max or 50
    @staleTimeout = options.staleTimeout or 1000
    @factory      = options.factory
    @recycle      = options.recycle

    @_pool = []


  ###
  ###

  create: (options) ->

    if @_pool.length
      item = @_pool.shift()
      @recycle item, options
      return item

    item = @factory options

    oldDispose = item.prototype.dispose

    item.__pool = @
    item.dispose = () =>
      if oldDispose
        oldDispose.call(item)

      @add item

    item


  ###
  ###

  add: (object) ->

    # cannot add an object not of the same pool
    if object.__pool isnt @
      return @

    @_pool.push object

    

    @




