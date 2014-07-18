import redis

__all__ = ('redis_client',)


class RedisClient(object):
    '''
    Obtains a connection to Redis. Restricts usage to a single connection pool.
    Uses the Borg design pattern (bit.ly/1oxVQNI) to maintain connection pool
    and credentials. Use documented below:

    from akobi.lib.redis_client import redis_client

    redis = redis_client.get_redis_instance()
    redis.set("Warren", "Smith")
    print "Get from redis: %s" % str(r.get("Warren"))
    '''

    __shared_state = {
        'HOST': 'localhost',
        'PORT': 6379,
        'DATABASE_NUMBER': 0,
        'POOL': None
    }

    def __init__(self):
        self.__dict__ = self.__shared_state
        if self.POOL is None:
            self.POOL = redis.ConnectionPool(
                host=self.HOST, port=self.PORT, db=self.DATABASE_NUMBER)

    def get_redis_instance(self):
        return redis.Redis(connection_pool=self.POOL)

redis_client = RedisClient()
