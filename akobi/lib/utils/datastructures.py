class TwoWayAttrDict(dict):
    """ Bidirectional map that acts as a normal dict and allows to search on both
        keys and values
    """
    def __init__(self, **kwargs):
        # Create a blank dict at first and then intelligently populate it with
        # the bidirectional mappings
        super(TwoWayAttrDict, self).__init__()

        if kwargs:
            super_setitem = super(TwoWayAttrDict, self).__setitem__
            for k in kwargs:
                super_setitem(k, kwargs[k])

                # We don't want to create two of the same mapping
                if not k == kwargs[k]:
                    super_setitem(kwargs[k], k)

        self.__dict__ = self
        
    def __setitem__(self, key, value):
        # Clear any existing mappings the key and/or value may have so there's
        # no conflicts
        if key in self:
            del self[key]

        if value in self:
            del self[value]

        super(TwoWayAttrDict, self).__setitem__(key, value)
        if not key == value:
            super(TwoWayAttrDict, self).__setitem__(value, key) 

    def __delitem__(self, key):
        super(TwoWayAttrDict, self).__delitem__(key)
        super(TwoWayAttrDict, self).__delitem__(self[key])
