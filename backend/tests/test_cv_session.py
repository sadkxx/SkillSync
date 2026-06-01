from app.services import cv_session


def setup_function():
    cv_session.clear_all()


def test_cv_sessions_are_isolated_by_session_id():
    cv_session.set_cv("USER_A_CV Python React SQL", session_id="session-a")
    cv_session.set_cv("USER_B_CV Java Docker AWS", session_id="session-b")

    assert cv_session.get_cv("session-a").startswith("USER_A_CV")
    assert cv_session.get_cv("session-b").startswith("USER_B_CV")


def test_unknown_session_has_no_cv():
    cv_session.set_cv("USER_A_CV Python React SQL", session_id="session-a")

    assert cv_session.get_cv("session-b") is None
