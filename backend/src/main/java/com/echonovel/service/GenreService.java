package com.echonovel.service;

import com.echonovel.dto.request.GenreRequest;
import com.echonovel.dto.response.GenreResponse;
import com.echonovel.entity.Genre;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    /**
     * Get all genres
     */
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll()
                .stream()
                .map(GenreResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new genre (Admin)
     */
    @Transactional
    public GenreResponse createGenre(GenreRequest request) {
        if (genreRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.GENRE_ALREADY_EXISTS);
        }

        Genre genre = Genre.builder()
                .name(request.getName())
                .build();

        genre = genreRepository.save(genre);
        log.info("Genre created: {}", genre.getName());
        return GenreResponse.fromEntity(genre);
    }

    /**
     * Update a genre (Admin)
     */
    @Transactional
    public GenreResponse updateGenre(Long id, GenreRequest request) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));

        if (!genre.getName().equals(request.getName()) && genreRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.GENRE_ALREADY_EXISTS);
        }

        genre.setName(request.getName());
        genre = genreRepository.save(genre);
        log.info("Genre updated: ID {}", genre.getId());
        return GenreResponse.fromEntity(genre);
    }

    /**
     * Delete a genre (Admin)
     */
    @Transactional
    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new AppException(ErrorCode.GENRE_NOT_FOUND);
        }
        genreRepository.deleteById(id);
        log.info("Genre deleted: ID {}", id);
    }
}
