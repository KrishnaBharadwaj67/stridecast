def get_target_words(duration_minutes: int) -> int:
    return duration_minutes * 150

def get_segments_count(duration_minutes: int) -> int:
    return max(1, duration_minutes // 3)

def test_word_count_30_min():
    assert get_target_words(30) == 4500

def test_word_count_10_min():
    assert get_target_words(10) == 1500

def test_segment_splitting():
    words = get_target_words(30)
    segments = get_segments_count(30)
    
    assert segments == 10
    assert 300 <= (words / segments) <= 450
