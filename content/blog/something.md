+++
title = "Fast Fourier Transform 이해하기"
date = 2025-02-23
draft = true

[taxonomies]
categories = ["Julia"]
tags = ["FFT"]

[extra]
lang = "kr"
toc = true
comment = true
copy = true
math = "katex"
mermaid = false
outdate_alert = false
outdate_alert_days = 120
display_tags = false
truncate_summary = false
featured = false
reaction = false
+++

# Introduction

Fast Fourier transform (FFT)는 신호 처리나 분석에서 중요하게 쓰이고 있다.
예를 들어 음파나 지진파를 분석하여 파동의 진원지를 특정하거나, 신호에서 노이즈를 제거하는데 큰 도움이 된다.

이 글에서는 discrete Fourier transform(DFT)를 이해하고 DFT의 가속 버전인 FFT의 알고리즘을 이해하고 Julia로 구현하여 실제로 얼마나 빠른지 확인해 볼 것이다.

# What is DFT

DFT는 단순히 Fourier transform의 불연속적 버전이라고 보면 된다.

Forward DFT:
$$ k_m = \sum^{N}_{n=1} x_n \cdot e^{-2\pi i (n-1) (m-1) / N} $$

Backward DFT:
$$ x_m = \frac{1}{N} \sum^{N}_{n=1} k_n \cdot e^{2\pi i (n-1) (m-1) / N} $$

각 element에 대한 합을 반복하면 아래와 같이 $O(N^2)$ 의 복잡도를 가진 함수로 표현할 수 있다.

```Julia
function dft_raw!(dst::T,src::T, phase::Number) where T <: AbstractVector{<:Complex}
    N = length(src)
    @assert length(dst) == N "The dst array should be equal to the src"
    dst .= 0
    for n in eachindex(src), m in eachindex(dst) # O(n^2) here
        dst[m] += src[n] * exp(phase*(n-1)*(m-1)/N)
    end
end

function dft!(dst, src)
    dft_raw!(dst, src, -2π*im)
end
function idft!(dst, src)
    dft_raw!(dst, src, 2π*im)
    dst .*= 1/length(src)
end
```

# What is FFT: Cooley-Tukey algorithm

"Fast" Fourier transform는 DFT를 $O(N^2)$ 보다 빠르게 풀기위해 고안됐다.
그 중 가장 많이 사용하는 "Cooley-Tukey algorithm"은 문제를 쪼개고 푸는 과정을 반복하여(divide-and-conquer) 복잡도를 최대 $O(N\log N)$으로 줄인다.

만약 N 이 2로 나누어 떨어지는 수라면 ($N=2L$), forward DFT의 경우 아래처럼 두 DFT로 분해할 수 있다.

$$
k_m = \sum^{N}_{n=1} x_n \cdot e^{-2\pi i (n-1) (m-1) / N} \\
    = \sum^{N/2}_{l=1} x_{2l} \cdot e^{-2\pi i (2l-1) (m-1) / N}
    + \sum^{N/2}_{l=1} x_{2l+1} \cdot e^{-2\pi i ((2l+1)-1) (m-1) / N} \\
    = \sum^{L}_{l=1} x_{2l} \cdot e^{-2\pi i (l-1/2) (m-1) / L}
    + \sum^{L}_{l=1} x_{2l+1} \cdot e^{-2\pi i l (m-1) / L} \\
    = e^{-\pi i (m-1) / L} \sum^{L}_{l=1} x_{2l} \cdot e^{-2\pi i (l-1) (m-1) / L}
    + e^{-2\pi i(m-1) / L} \sum^{L}_{l=1} x_{2l+1} \cdot e^{-2\pi i (l-1) (m-1) / L}
$$

만약 3으로 나누어 떨어지면 3개로 쪼개면 된다. 2로 쪼갤 수 있는 경우에 한정하여 "Cooley-Tukey algorithm"이라고 부르고 n개로 쪼개는 방법을 split-radix FFT라고 한다. 만약 n으로 쪼개서 문제를 풀 수 있으면 radix-n 이라고 한다.


## Reference

 - [1] https://jakevdp.github.io/blog/2013/08/28/understanding-the-fft/