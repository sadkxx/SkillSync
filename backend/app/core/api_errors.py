import logging

from fastapi import HTTPException

GENERIC_500_MESSAGE = "Islem sirasinda bir hata olustu. Lutfen tekrar deneyin."
logger = logging.getLogger("skillsync.api")


def http_500_safe(exc: Exception, *, context: str = "") -> HTTPException:
    if context:
        logger.exception("%s: %s", context, exc)
    else:
        logger.exception("Unhandled API error: %s", exc)
    return HTTPException(status_code=500, detail=GENERIC_500_MESSAGE)
